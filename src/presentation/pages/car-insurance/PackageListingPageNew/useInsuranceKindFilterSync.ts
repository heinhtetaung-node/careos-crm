import { useCallback, useEffect } from 'react';
import {
  COMPULSORY_INSURANCE_TYPE,
  getInsuranceKindFromTypes,
  getInsuranceTypesFromLead,
} from './insuranceKind';

interface LeadInsuranceData {
  insuranceKind?: string;
  voluntaryInsuranceType?: string[];
}

interface UseInsuranceKindFilterSyncParams {
  leadData?: LeadInsuranceData;
  updateLead: (path: string, value: unknown) => void;
  setInsuranceTypes: (types: string[]) => void;
  setInsuranceCategory: (insuranceKind: string) => void;
  setCurrentData: (updater: (prev: any) => any) => void;
}

export const useInsuranceKindFilterSync = ({
  leadData,
  updateLead,
  setInsuranceTypes,
  setInsuranceCategory,
  setCurrentData,
}: UseInsuranceKindFilterSyncParams) => {
  const applyInsuranceKind = useCallback(
    (insuranceKind: string) => {
      setInsuranceCategory(insuranceKind);
      setCurrentData((prev: any) => ({
        ...prev,
        insuranceKind,
      }));
    },
    [setCurrentData, setInsuranceCategory]
  );

  useEffect(() => {
    if (!leadData) {
      return;
    }

    setInsuranceTypes(
      getInsuranceTypesFromLead(
        leadData.insuranceKind,
        leadData.voluntaryInsuranceType || []
      )
    );

    if (leadData.insuranceKind) {
      applyInsuranceKind(leadData.insuranceKind);
    }
  }, [
    applyInsuranceKind,
    leadData?.insuranceKind,
    leadData?.voluntaryInsuranceType,
    setInsuranceTypes,
  ]);

  return useCallback(
    (types: string[]) => {
      const insuranceKind = getInsuranceKindFromTypes(types);
      const voluntaryTypes = types.filter(
        (type) => type !== COMPULSORY_INSURANCE_TYPE
      );

      updateLead('/voluntaryInsuranceType', voluntaryTypes);
      if (insuranceKind) {
        applyInsuranceKind(insuranceKind);
      }

      if (insuranceKind && leadData?.insuranceKind !== insuranceKind) {
        updateLead('/insuranceKind', insuranceKind);
      }

      setInsuranceTypes(types);
    },
    [applyInsuranceKind, leadData?.insuranceKind, setInsuranceTypes, updateLead]
  );
};
