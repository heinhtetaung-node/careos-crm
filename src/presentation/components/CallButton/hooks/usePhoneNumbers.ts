import { useMemo } from 'react';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

export default function usePhoneNumbers() {
  const lead = useGetLeadSelector();

  // Get phone numbers from props or lead data
  const phoneNumbers = useMemo(
    () => lead.data?.customerPhoneNumber ?? [],
    [lead.data?.customerPhoneNumber]
  );

  // Get primary phone index from props or lead data
  const primaryPhoneIndex = useMemo(
    () => lead.data?.primaryPhoneIndex ?? 0,
    [lead.data?.primaryPhoneIndex]
  );

  return {
    phoneNumbers,
    primaryPhoneIndex,
  };
}
