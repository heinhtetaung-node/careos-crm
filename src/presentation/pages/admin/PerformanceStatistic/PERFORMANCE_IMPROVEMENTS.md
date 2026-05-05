# PerformanceStatistic performance improvements

This document records all performance-focused changes that have been applied to the PerformanceStatistic page.

## Executive summary

Using the same 65-second scenario before and after optimization, the PerformanceStatistic page now uses substantially less main-thread time and feels more responsive:

- `Scripting`: down from `21,712ms` to `10,087ms` (**53.5% reduction**)
- `Rendering`: down from `3,006ms` to `1,681ms` (**44.1% reduction**)
- `Painting`: down from `2,317ms` to `1,155ms` (**50.2% reduction**)
- `System`: down from `3,194ms` to `2,459ms` (**23.0% reduction**)
- `INP`: improved from `162ms` to `91ms` (**43.8% improvement**)

This is a strong, measurable win in both performance cost and perceived interactivity.

## Baseline issue summary

Initial reports indicated:

- Slow rendering while the page is open for extended periods.
- Continuous CPU usage from repeated UI updates.
- Suspected memory leak behavior.

## Improvements applied so far

### 1) Stabilized card component memoization

- Moved `React.memo(CallStatsCard)` out of the render function in `PerformanceStatisticContent`.
- Prevented recreation of memoized component on every parent render.

### 2) Reduced polling-related re-renders

- Replaced polling counters/flags stored in React state with refs:
  - `pollCounterRef`
  - `isPollingRequestRef`
- Avoided extra re-renders caused by non-visual polling state updates.

### 3) Cleaned timer lifecycle to reduce leak risk

- Added cleanup for delayed loading timeout in `PerformanceStatisticContent`.
- Ensured timers are cleared on unmount.

### 4) Improved card identity stability

- Switched card wrapper key to stable `userId` instead of concatenating mutable values.
- Reduced remounts and state loss when names/data update.

### 5) Replaced per-card intervals with shared parent ticker

- Removed per-card `setInterval` logic from `CallStatsCard`.
- Introduced one parent-level ticker (`nowTick`) and derived displayed duration in each card.
- Reduced number of active timers from O(number of cards) to O(1).

### 6) Reduced prop churn in card mapping

- Passed stable callbacks where possible (`onToggleWatched`, `handleLiveListen`, noop callback).
- Avoided creating new inline function props for every card each render.

### 7) Added row/window virtualization (manual strategy)

- Introduced row-window rendering to mount only visible rows (+overscan) instead of all cards.
- Kept all cards in data state, but reduced DOM nodes and reconciliation work.

### 8) Reduced scroll-time layout pressure

- Throttled viewport update handling with `requestAnimationFrame`.
- Removed repeated layout reads from scroll path.
- Changed page reset scroll from `smooth` to `auto` to avoid extra animation/layout churn on refresh.

### 9) Replaced manual virtualization with library virtualizer

- Added `@tanstack/react-virtual` and migrated from custom row-window math.
- Switched to `useWindowVirtualizer` for robust window-based virtualization.
- Kept non-virtual fallback during initial measurement to avoid blank first paint.

### 10) Gated ticker updates to cut background JS work

- Ticker runs only when at least one visible card has a live-time status (`oncall`/`idle-*`).
- Ticker pauses when tab is hidden (`visibilitychange`).
- Prevents unnecessary periodic updates when no visible card needs live timing.

## Current behavior after these changes

Observed from traces:

- Main-thread pressure is materially reduced across scripting/rendering/painting.
- Interaction responsiveness improved (`INP` dropped from `162ms` to `91ms`).
- No leak pattern was observed in the compared recordings; the dominant cost is periodic workload, not runaway growth.

## Before/After metrics (same timeline, same actions)

| Metric    |   Before |    After | Improvement |
| --------- | -------: | -------: | ----------: |
| Scripting | 21,712ms | 10,087ms |  **-53.5%** |
| Rendering |  3,006ms |  1,681ms |  **-44.1%** |
| Painting  |  2,317ms |  1,155ms |  **-50.2%** |
| System    |  3,194ms |  2,459ms |  **-23.0%** |
| INP       |    162ms |     91ms |  **-43.8%** |

## What improved in user experience terms

- Page stays smoother over time under live polling conditions.
- Lower main-thread workload reduces jank risk while scrolling and interacting.
- Faster interaction response (`INP`) makes controls and page actions feel more immediate.
- Optimization is now backed by reproducible before/after profiling data.

## Before Improvement

![alt text](image-1.png)

## After Improvement

![alt text](image-2.png)
