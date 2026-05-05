import { act, renderHook } from '@testing-library/react';

import FeatureFlags from 'config/flagsmithConfig';

import {
  useLeadPitchChecklist,
  useLeadPitchChecklistSection,
} from './useLeadPitchChecklist';

let mockFlagEnabled: boolean | undefined = false;
let omitFlagFromResponse = false;

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn(() =>
    omitFlagFromResponse
      ? {}
      : {
          [FeatureFlags.BROK_5648_ENABLE_LEAD_PITCH_CHECKLIST_20260417_TEMP]: {
            enabled: mockFlagEnabled,
          },
        }
  ),
}));

describe('useLeadPitchChecklist', () => {
  const baseArgs = {
    leadRouteParamId: 'lead-a',
    user: { name: 'tsr-one' },
    assignmentResponse: [{ user: 'tsr-one' }],
    lead: { status: 'LEAD_STATUS_IN_PROGRESS', isRejected: false },
  };

  it('isPitchChecklistEditable when assignee and lead is editable', () => {
    const { result } = renderHook(() => useLeadPitchChecklist(baseArgs));

    expect(result.current.isPitchChecklistEditable).toBe(true);
  });

  it('is not editable when user is not assignee', () => {
    const { result } = renderHook(() =>
      useLeadPitchChecklist({
        ...baseArgs,
        user: { name: 'other' },
      })
    );

    expect(result.current.isPitchChecklistEditable).toBe(false);
  });

  it('is not editable for read-only lead status', () => {
    const { result } = renderHook(() =>
      useLeadPitchChecklist({
        ...baseArgs,
        lead: { status: 'LEAD_STATUS_CANCELLED', isRejected: false },
      })
    );

    expect(result.current.isPitchChecklistEditable).toBe(false);
  });

  it('is not editable when lead is rejected', () => {
    const { result } = renderHook(() =>
      useLeadPitchChecklist({
        ...baseArgs,
        lead: { status: 'LEAD_STATUS_IN_PROGRESS', isRejected: true },
      })
    );

    expect(result.current.isPitchChecklistEditable).toBe(false);
  });

  it('collapses when leadRouteParamId changes', () => {
    const { result, rerender } = renderHook(
      (props: typeof baseArgs) => useLeadPitchChecklist(props),
      { initialProps: baseArgs }
    );

    act(() => {
      result.current.setIsPitchChecklistExpanded(true);
    });
    expect(result.current.isPitchChecklistExpanded).toBe(true);

    rerender({ ...baseArgs, leadRouteParamId: 'lead-b' });

    expect(result.current.isPitchChecklistExpanded).toBe(false);
  });

  it('handlePitchChecklistCallStart expands only for LEAD_STATUS_NEW', () => {
    const { result, rerender } = renderHook(
      (props: typeof baseArgs) => useLeadPitchChecklist(props),
      {
        initialProps: {
          ...baseArgs,
          lead: { status: 'LEAD_STATUS_NEW', isRejected: false },
        },
      }
    );

    act(() => {
      result.current.handlePitchChecklistCallStart();
    });
    expect(result.current.isPitchChecklistExpanded).toBe(true);

    act(() => {
      result.current.setIsPitchChecklistExpanded(false);
    });

    rerender({
      ...baseArgs,
      lead: { status: 'LEAD_STATUS_IN_PROGRESS', isRejected: false },
    });

    act(() => {
      result.current.handlePitchChecklistCallStart();
    });
    expect(result.current.isPitchChecklistExpanded).toBe(false);
  });
});

describe('useLeadPitchChecklistSection', () => {
  const baseArgs = {
    leadRouteParamId: 'lead-a',
    user: { name: 'tsr-one' },
    assignmentResponse: [{ user: 'tsr-one' }],
    lead: { status: 'LEAD_STATUS_IN_PROGRESS', isRejected: false },
  };

  beforeEach(() => {
    mockFlagEnabled = false;
    omitFlagFromResponse = false;
  });

  it('exposes isLeadPitchChecklistEnabled = false when the feature flag is disabled', () => {
    mockFlagEnabled = false;
    const { result } = renderHook(() => useLeadPitchChecklistSection(baseArgs));

    expect(result.current.isLeadPitchChecklistEnabled).toBe(false);
  });

  it('exposes isLeadPitchChecklistEnabled = true when the feature flag is enabled', () => {
    mockFlagEnabled = true;
    const { result } = renderHook(() => useLeadPitchChecklistSection(baseArgs));

    expect(result.current.isLeadPitchChecklistEnabled).toBe(true);
  });

  it('defaults to false when the flag entry is missing from the response', () => {
    omitFlagFromResponse = true;
    const { result } = renderHook(() => useLeadPitchChecklistSection(baseArgs));

    expect(result.current.isLeadPitchChecklistEnabled).toBe(false);
  });

  it('defaults to false when the flag enabled field is undefined', () => {
    mockFlagEnabled = undefined;
    const { result } = renderHook(() => useLeadPitchChecklistSection(baseArgs));

    expect(result.current.isLeadPitchChecklistEnabled).toBe(false);
  });

  it('forwards all fields from useLeadPitchChecklist', () => {
    mockFlagEnabled = true;
    const { result } = renderHook(() => useLeadPitchChecklistSection(baseArgs));

    expect(result.current).toEqual(
      expect.objectContaining({
        isLeadPitchChecklistEnabled: true,
        isPitchChecklistExpanded: false,
        isPitchChecklistEditable: true,
        setIsPitchChecklistExpanded: expect.any(Function),
        handlePitchChecklistCallStart: expect.any(Function),
      })
    );
  });

  it('forwarded handlers still mutate the inner hook state', () => {
    mockFlagEnabled = true;
    const { result } = renderHook(() =>
      useLeadPitchChecklistSection({
        ...baseArgs,
        lead: { status: 'LEAD_STATUS_NEW', isRejected: false },
      })
    );

    act(() => {
      result.current.handlePitchChecklistCallStart();
    });

    expect(result.current.isPitchChecklistExpanded).toBe(true);

    act(() => {
      result.current.setIsPitchChecklistExpanded(false);
    });

    expect(result.current.isPitchChecklistExpanded).toBe(false);
  });
});
