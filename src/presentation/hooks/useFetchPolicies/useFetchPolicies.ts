import { useEffect, useState } from 'react';

import { useLazyGetAccountPoliciesQuery } from 'data/slices/policySlice';
import type { AccountCurrentProductData } from 'shared/types/policy';
import type { Lead } from 'shared/types/lead';

export const useFetchPolicies = (lead: Lead | null | undefined) => {
  const [policiesData, setPoliciesData] =
    useState<AccountCurrentProductData | null>(null);
  const [getAccountPolicies] = useLazyGetAccountPoliciesQuery();

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!lead?.data) {
        return;
      }

      const primaryIndex = lead.data.primaryPhoneIndex ?? 0;
      let phoneNumber =
        lead.data.customerPhoneNumber?.length > primaryIndex
          ? lead.data.customerPhoneNumber[primaryIndex].phone
          : '';

      // Remove '+' prefix if present (API expects format: 66999999999)
      phoneNumber = phoneNumber.replace(/^\+/, '');

      let idNumber = '';
      let taxId = '';

      if (lead.data.policyHolderType === 'company') {
        taxId = lead.data.customerPolicyAddress?.[0]?.taxId
          ? lead.data.customerPolicyAddress?.[0]?.taxId
          : '';
        // Don't fetch if company has no taxId
        if (!taxId) {
          return;
        }
      } else {
        idNumber = lead.data.policyHolderNationalId ?? '';
        // Don't fetch if individual has no nationalId
        if (!idNumber) {
          return;
        }
      }

      // Only fetch if we have at least one identifier
      if (!phoneNumber && !idNumber && !taxId) {
        return;
      }

      try {
        const response = await getAccountPolicies({
          phoneNumber,
          idNumber,
          taxId,
        }).unwrap();

        setPoliciesData(response);
      } catch (error) {
        console.error('Failed to fetch account policies:', error);
      }
    };

    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.data]);

  return policiesData;
};
