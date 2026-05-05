import { PRODUCTS } from 'config/TypeFilter';
import { HealthLead, Lead } from 'shared/types/lead';

export const formatLead = (lead: Lead) => {
  const { data } = lead;

  const formattedLead = {
    ...lead,
  };

  // Add health insurance-specific fields if applicable
  if (lead.product === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
    const healthData = data as unknown as HealthLead['data'];
    formattedLead.data = {
      ...formattedLead.data,
      customerFirstName: healthData?.customer?.firstName ?? '',
      customerLastName: healthData?.customer?.lastName ?? '',
      customerEmail: healthData?.customer?.emails ?? [],
      customerPhoneNumber: (healthData.customer.phoneNumbers as any) ?? [],
      customerDOB: healthData?.customer?.dob ?? '',
      customerGender: healthData?.customer?.gender ?? '',
      primaryPhoneIndex: healthData?.customer?.primaryPhoneIndex,

      customerBillingAddress: healthData?.billingAddresses ?? [],
      customerPolicyAddress: healthData?.policyAddresses ?? [],
      customerShippingAddress: healthData?.shippingAddresses ?? [],

      policyHolderFirstName: healthData.policyHolder?.firstName ?? '',
      policyHolderLastName: healthData.policyHolder?.lastName ?? '',
      policyHolderDOB: healthData.policyHolder?.dob ?? '',
      policyHolderType: (healthData.policyHolder?.type ?? '') as any,
      policyHolderNationalId: healthData.policyHolder?.nationalId ?? '',
      policyHolderRace: healthData?.policyHolder?.race ?? '',
      policyHolderOccupation: healthData?.policyHolder?.occupation ?? '',

      policyTitle: healthData.policyHolder?.title ?? '',
      policyStartDate: healthData?.policyStartDate ?? '',
    };
  }

  return formattedLead;
};
