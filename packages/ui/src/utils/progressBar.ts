export function getSafePercent(percent: number) {
  if (percent > 100 || percent < 0 || typeof percent !== 'number') {
    console.warn(
      `[progress-bar]: The value passed to percent or position needs to be a number between 0 and 100 (passed value: ${percent}).`
    );
  }
  return Math.min(100, Math.max(percent, 0));
}

export function getStepPosition(
  steps: number,
  stepIndex: number,
  hasStepZero?: boolean
) {
  if (hasStepZero) {
    return (100 / (steps - 1)) * stepIndex;
  }
  return (100 / steps) * (stepIndex + 1);
}

export const transitions = {
  scale: {
    entering: { transform: 'translateX(-50%) scale(1.5)' },
    entered: { transform: 'translateX(-50%) scale(1)' },
    exiting: { transform: 'translateX(-50%) scale(1.5)' },
    exited: { transform: 'translateX(-50%) scale(1)' },
  },
  rotate: {
    entering: { transform: 'translateX(-50%) rotate(360deg)' },
    entered: { transform: 'translateX(-50%) rotate(0deg)' },
    exiting: { transform: 'translateX(-50%) rotate(0deg)' },
    exited: { transform: 'translateX(-50%) rotate(360deg)' },
  },
  skew: {
    entering: { transform: 'translateX(-50%) skewX(20deg)' },
    entered: { transform: 'translateX(-50%) skewX(0deg)' },
    exiting: { transform: 'translateX(-50%) skewX(20deg)' },
    exited: { transform: 'translateX(-50%) skewX(0deg)' },
  },
};
