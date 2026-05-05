export const COMPULSORY_INSURANCE_TYPE = 'compulsory';

export const getInsuranceKindFromTypes = (types: string[]) => {
  if (!types.length) {
    return undefined;
  }

  const voluntaryTypes = types.filter(
    (type) => type !== COMPULSORY_INSURANCE_TYPE
  );
  const hasCompulsory = types.includes(COMPULSORY_INSURANCE_TYPE);
  const hasVoluntary = voluntaryTypes.length > 0;

  if (hasVoluntary && hasCompulsory) {
    return 'both';
  }

  return hasCompulsory ? 'mandatory' : 'voluntary';
};

export const getInsuranceTypesFromLead = (
  insuranceKind?: string,
  voluntaryInsuranceTypes: string[] = []
) => [
  ...voluntaryInsuranceTypes,
  ...(insuranceKind === 'both' || insuranceKind === 'mandatory'
    ? [COMPULSORY_INSURANCE_TYPE]
    : []),
];
