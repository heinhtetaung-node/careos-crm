import { useFlags } from 'flagsmith/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import FeatureFlags from 'config/flagsmithConfig';

export const PITCH_CHECKLIST_READ_ONLY_STATUSES = [
  'LEAD_STATUS_CANCELLED',
  'LEAD_STATUS_PAID_ONLINE',
  'LEAD_STATUS_PURCHASED',
] as const;

const READ_ONLY_SET: ReadonlySet<string> = new Set(
  PITCH_CHECKLIST_READ_ONLY_STATUSES
);

export interface LeadAssignment {
  user?: string;
}

export interface UseLeadPitchChecklistArgs {
  leadRouteParamId: string | undefined;
  user?: { name?: string };
  assignmentResponse: LeadAssignment[] | null | undefined;
  lead?: { status?: string; isRejected?: boolean };
}

export function useLeadPitchChecklist({
  leadRouteParamId,
  user,
  assignmentResponse,
  lead,
}: UseLeadPitchChecklistArgs) {
  const [isPitchChecklistExpanded, setIsPitchChecklistExpanded] =
    useState(false);

  useEffect(() => {
    setIsPitchChecklistExpanded(false);
  }, [leadRouteParamId]);

  const isPitchChecklistEditable = useMemo(() => {
    const isAssignedUser =
      Boolean(user?.name) && assignmentResponse?.[0]?.user === user?.name;
    const isLeadReadOnly =
      READ_ONLY_SET.has(lead?.status ?? '') || Boolean(lead?.isRejected);

    return Boolean(isAssignedUser && !isLeadReadOnly);
  }, [assignmentResponse, lead?.isRejected, lead?.status, user?.name]);

  const handlePitchChecklistCallStart = useCallback(() => {
    if (lead?.status === 'LEAD_STATUS_NEW') {
      setIsPitchChecklistExpanded(true);
    }
  }, [lead?.status]);

  return {
    isPitchChecklistExpanded,
    setIsPitchChecklistExpanded,
    isPitchChecklistEditable,
    handlePitchChecklistCallStart,
  };
}

export function useLeadPitchChecklistSection(args: UseLeadPitchChecklistArgs) {
  const featureFlags = useFlags([
    FeatureFlags.BROK_5648_ENABLE_LEAD_PITCH_CHECKLIST_20260417_TEMP,
  ]);
  const isLeadPitchChecklistEnabled =
    featureFlags[
      FeatureFlags.BROK_5648_ENABLE_LEAD_PITCH_CHECKLIST_20260417_TEMP
    ]?.enabled ?? false;

  const checklist = useLeadPitchChecklist(args);

  return {
    isLeadPitchChecklistEnabled,
    ...checklist,
  };
}
