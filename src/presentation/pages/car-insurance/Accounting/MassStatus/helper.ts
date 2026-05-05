export const premiumRemittanceTemplate = ['shortID'];

export const premiumReturnTemplate = ['shortID'];
export const customerRefundTemplate = [
  'shortID',
  'actual_refund_amount_customer',
];

export const templateTypes = [
  'importPremiumRemittanceStatus',
  'importPremiumReturnStatus',
  'importCustomerRefund',
];

export const getRequiredColumnsByType: (
  type: (typeof templateTypes)[number]
) => string[] = (type) => {
  const defaultColumn = ['shortID'];

  switch (type) {
    case templateTypes[0]:
      return premiumRemittanceTemplate;
    case templateTypes[1]:
      return premiumReturnTemplate;
    case templateTypes[2]:
      return customerRefundTemplate;
    default:
      return defaultColumn;
  }
};

export const getTemplateByType: (
  type: (typeof templateTypes)[number]
) => string[] = (type) => {
  switch (type) {
    case templateTypes[0]:
      return premiumRemittanceTemplate;
    case templateTypes[1]:
      return premiumReturnTemplate;
    case templateTypes[2]:
      return customerRefundTemplate;
    default:
      return [];
  }
};
export const templateWithDataType = (type: string) =>
  getTemplateByType(type).map((template) => ({
    name: template,
    dataType: [
      'actual_return_amount_insurer',
      'actual_return_amount_rcb',
      'actual_refund_amount_customer',
    ].includes(template)
      ? 'number'
      : 'string',
  }));
