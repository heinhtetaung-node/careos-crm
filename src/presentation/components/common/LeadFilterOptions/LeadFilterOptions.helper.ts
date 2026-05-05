import { getString } from 'presentation/theme/localization';
import { PurchasingPurposes } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';

export const defaultYesNoOptions = [
  { key: 'true', label: getString('leadFilter.yes'), value: 'true' },
  { key: 'false', label: getString('leadFilter.no'), value: 'false' },
];

export const genderOptions = [
  { key: 'm', label: getString('text.male') },
  { key: 'f', label: getString('text.female') },
];

export const languageOptions = [
  { key: 'th-th', label: getString('text.thai') },
  { key: 'th-en', label: getString('leadFilter.english') },
];

export const ALLOWED_FIXED_DRIVER_COUNTS = [0, 1, 2];

export const getFieldTitle = (config: any, key: string, fallbackKey: string) =>
  getString(config[key]?.title || fallbackKey);

export const getFieldTooltip = (config: any, key: string) =>
  getString(config[key]?.tooltip);

export const getFieldOptions = (
  config: any,
  key: string,
  fallbackOptions: any[] = []
) => config[key]?.options ?? fallbackOptions;

export const getFieldMeta = (fieldKey: string, currentData: any) => {
  const type = currentData?.policyHolderType;

  const hiddenFields = [
    'policyTitle',
    'policyHolderFirstName',
    'policyHolderLastName',
    'policyHolderNationalId',
    'policyHolderDOB',
    'policyHolderAge',
  ];

  const readOnlyFields = [
    'policyHolderFirstName',
    'policyHolderLastName',
    'policyHolderDOB',
    'policyTitle',
  ];

  let hidden = false;
  if (hiddenFields.includes(fieldKey)) {
    hidden = type === PurchasingPurposes.companyIsPolicyHolder;
  } else if (
    ['policyHolderCompanyName', 'policyHolderTaxId'].includes(fieldKey)
  ) {
    hidden = type !== PurchasingPurposes.companyIsPolicyHolder;
  }

  const readOnly = readOnlyFields.includes(fieldKey)
    ? type === PurchasingPurposes.customerIsPolicyHolder
    : false;

  return { hidden, readOnly };
};

export const policyDateValidation = (
  date: string,
  setWarning: (message: string) => void
): boolean => {
  if (!date) return true; // Allow empty dates
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  maxDate.setHours(23, 59, 59, 999);
  if (selectedDate > maxDate) {
    const formattedMaxDate = maxDate.toLocaleDateString('en-GB');
    setWarning(
      getString('text.invalidDateFromCurrent', {
        dateAfterSixMonths: formattedMaxDate,
      })
    );
    return false;
  }
  if (selectedDate < today) {
    setWarning(getString('text.invalidDateWithCurrent'));
    return false;
  }
  setWarning('');
  return true;
};

export const dobValidation = (
  value: string,
  setWarning: (warning: string) => void
): boolean => {
  if (!value) {
    // Empty values are considered valid (optional fields)
    // Don't call setWarning for empty values
    return true;
  }
  const selectedDate = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - selectedDate.getFullYear();
  const monthDiff = today.getMonth() - selectedDate.getMonth();
  const accurateAge =
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < selectedDate.getDate())
      ? age - 1
      : age;
  if (accurateAge < 18) {
    setWarning(getString('errors.invalidAgeUnder'));
    return false;
  }
  if (accurateAge > 100) {
    setWarning(getString('errors.invalidAgeOver'));
    return false;
  }
  setWarning('');
  return true;
};

type JsonPatchOp = 'add' | 'remove' | 'replace';

export interface LeadPatch {
  path: string;
  op: JsonPatchOp;
  value?: any;
}

type UpdateLead = (path: string, value: any) => Promise<void>;

export type JsonUpdater = (params: LeadPatch[]) => Promise<unknown>;

const unwrapValue = (value: any) => value?.value ?? value;

const isErrorResponse = (response: unknown): response is { error: unknown } =>
  Boolean(response && typeof response === 'object' && 'error' in response);

const buildInsuranceKindPatches = (value: any): LeadPatch[] => {
  const resolved = unwrapValue(value);
  return [
    { path: '/insuranceKind', op: 'add', value: resolved },
    ...(resolved === 'mandatory'
      ? [{ path: '/voluntaryInsuranceType', op: 'add' as const, value: [] }]
      : []),
  ];
};

export const handleUpdateLead = async (
  key: string,
  value: any,
  updateLead: UpdateLead,
  jsonUpdater: JsonUpdater
): Promise<boolean> => {
  try {
    switch (key) {
      case 'policyHolderAge':
        return true;
      case 'redPlate':
        await updateLead(
          '/carLicensePlate',
          value === 'true' ? 'redplate' : ''
        );
        return true;
      case 'customerLanguage':
        await updateLead('/locale', value);
        return true;
      case 'policyHolderCompanyName':
        await updateLead('/customerPolicyAddress/0/companyName', value);
        return true;
      case 'policyHolderTaxId':
        await updateLead('/customerPolicyAddress/0/taxId', value);
        return true;
      case 'policyTitle':
        await updateLead(
          `/${key}`,
          Array.isArray(value) ? value.map((i) => i.value || i) : value
        );
        return true;
      case 'insuranceKind': {
        const response = await jsonUpdater(buildInsuranceKindPatches(value));
        return !isErrorResponse(response);
      }
      default:
        await updateLead(`/${key}`, unwrapValue(value));
        return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const handlePolicyHolderTypeChange = (
  type: string,
  currentData: any,
  setCurrentMultipleData: (obj: { [key: string]: any }) => void,
  updateLead: (
    path: string,
    value: any,
    type?: 'add' | 'remove' | 'replace'
  ) => void
) => {
  const map = {
    [PurchasingPurposes.customerIsPolicyHolder]: {
      policyHolderType: type,
      policyHolderFirstName: currentData.customerFirstName,
      policyHolderLastName: currentData.customerLastName,
      policyHolderDOB: currentData.customerDOB,
      policyTitle: currentData.policyTitle,
    },
    [PurchasingPurposes.companyIsPolicyHolder]: {
      policyHolderType: type,
      policyHolderCompanyName: '',
      policyHolderTaxId: '',
    },
  };
  if (type === 'straw_buyer') {
    const updateData: { [key: string]: any } = {};
    if (currentData?.policyHolderNationalId) {
      updateLead('/policyHolderNationalId', '', 'remove');
      updateData.policyHolderNationalId = '';
    }
    if (currentData?.policyTitle) {
      updateLead('/policyTitle', '', 'remove');
      updateData.policyTitle = '';
    }
    setCurrentMultipleData(
      map[type as keyof typeof map] ?? {
        policyHolderType: type,
        policyHolderFirstName: '',
        policyHolderLastName: '',
        policyHolderDOB: '',
        policyTitle: '',
        ...updateData,
      }
    );
    return;
  }
  setCurrentMultipleData(
    map[type as keyof typeof map] ?? {
      policyHolderType: type,
      policyHolderFirstName: '',
      policyHolderLastName: '',
      policyHolderDOB: '',
      policyTitle: '',
    }
  );
};

export const runValidation = (
  key: string,
  value: string,
  setPolicyStartDateWarning: (warning: string) => void,
  setCompulsoryPolicyStartDateWarning: (warning: string) => void,
  setCustomerDOBWarning: (warning: string) => void,
  setPolicyHolderDOBWarning: (warning: string) => void
): boolean => {
  switch (key) {
    case 'policyStartDate':
      return policyDateValidation(value, setPolicyStartDateWarning);
    case 'compulsoryPolicyStartDate':
      return policyDateValidation(value, setCompulsoryPolicyStartDateWarning);
    case 'customerDOB':
      return dobValidation(value, setCustomerDOBWarning);
    case 'policyHolderDOB':
      return dobValidation(value, setPolicyHolderDOBWarning);
    default:
      return true;
  }
};
