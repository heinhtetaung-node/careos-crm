import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';
import ProductOptions from 'shared/constants/productOptions';
import { formatBahtToSatang, satangToBaht } from 'utils/currency';
import { format, transformDateFormat } from 'utils/datetime';

export const formatAmount = (amt: number, options?: object) => {
  if (options) return Number(amt).toLocaleString(undefined, options);
  // can pass currency as follows:
  // { style: 'currency', currency: 'THB', }
  return Number(amt).toLocaleString(undefined);
};

/**
 * Converts the amount into a number with two decimal places
 *
 * @param amt - The original amount
 * @returns The formatted amount as a string with two decimal places
 */
export const formatAmountToDecimal = (amt: number) =>
  Number(amt)
    .toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
    })
    .substring(1);

export const getDiscountAmount = (discounts: string[]) => {
  if (discounts) {
    const result = discounts.reduce(
      (total, current) => total + parseInt(current, 10),
      0
    );
    return formatAmount(satangToBaht(result));
  }
  return 0;
};

interface ResultType {
  orderId: string;
  policyId: string;
  policyStartDate?: string;
  adjustedPremium?: number;
  policyNumber?: string;
  applicationNumber?: string;
}

export const modifyPolicySaveData = (
  orderId: string,
  policyId: string,
  values: any,
  stateValues: any
) => {
  let access = false;
  const result: ResultType = {
    orderId,
    policyId,
  };
  const { policyStartDate, adjustedPremium, policyNumber, applicationNumber } =
    stateValues;
  const adjustedPremiumValue = formatBahtToSatang(values.adjustedPremium);

  const res = format(
    new Date(transformDateFormat(values.policyDate) as string),
    'yyyy-MM-dd'
  );

  const convertedDate = new Date(res).toISOString();

  if (
    adjustedPremium !== adjustedPremiumValue &&
    format(new Date(policyStartDate), 'dd/MM/yyyy') !== values.policyDate
  ) {
    access = true;
    result.adjustedPremium = Number(adjustedPremiumValue);
    result.policyStartDate = convertedDate;
  }
  if (adjustedPremium !== adjustedPremiumValue) {
    access = true;
    result.adjustedPremium = Number(adjustedPremiumValue);
  } else if (
    format(new Date(policyStartDate), 'dd/MM/yyyy') !== values.policyDate
  ) {
    access = true;
    result.policyStartDate = convertedDate;
  }

  if (policyNumber !== values.policyNumber) {
    access = true;
    result.policyNumber = values.policyNumber;
  }

  if (applicationNumber !== values.applicationNumber) {
    access = true;
    result.applicationNumber = values.applicationNumber;
  }

  return access ? result : undefined;
};

export const getProductName = (name: string) => {
  if (name) {
    const product = ProductOptions.find((item: any) => item.value === name);
    return product && getString(product.title);
  }
  return '';
};

export const items: IFormikControllerProps[] = [
  {
    title: 'leadDetailFields.insurer',
    name: 'insurer',
    fieldType: 'text',
    dataTestId: 'insurance-insurer',
    display: true,
  },
  {
    title: 'text.insuranceCategory',
    name: 'insuranceType',
    fieldType: 'text',
    dataTestId: 'insurance-insurance-type',
    display: true,
  },
  {
    title: 'text.productType',
    name: 'product',
    fieldType: 'text',
    dataTestId: 'insurance-product',
    display: true,
  },
  {
    title: 'leadDetailFields.applicationNumber',
    name: 'applicationNumber',
    fieldType: 'text',
    dataTestId: 'application-number',
    display: true,
    showAsterisk: false,
  },
  {
    title: 'tableListing.policyNumber',
    name: 'policyNumber',
    fieldType: 'text',
    dataTestId: 'insurance-policy-number',
    display: true,
    showAsterisk: true,
  },
  {
    title: 'leadDetailFields.packageName',
    name: 'packageName',
    fieldType: 'text',
    dataTestId: 'insurance-package-name',
    display: true,
  },
  {
    title: 'leadDetailFields.orderNetPreium',
    name: 'netPremium',
    fieldType: 'text',
    display: true,
    dataTestId: 'insurance-net-premium',
  },
  {
    title: 'leadDetailFields.orderDiscount',
    name: 'discount',
    fieldType: 'text',
    display: true,
    dataTestId: 'insurance-discount',
  },
  {
    title: 'leadDetailFields.orderTotalPreium',
    name: 'grossPremium',
    fieldType: 'text',
    dataTestId: 'insurance-gross-premium',
    display: true,
  },
  {
    title: 'leadDetailFields.policyDate',
    name: 'policyDate',
    fieldType: 'datefield',
    display: true,
    placeholder: 'DD/MM/YYYY',
    dataTestId: 'insurance-policy-date',
  },
  {
    title: 'leadDetailFields.orderOwnCarDamage',
    name: 'ownCarDamage',
    fieldType: 'text',
    display: true,
    dataTestId: 'insurance-own-car-damage',
  },
  {
    title: 'leadDetailFields.orderDeductible',
    name: 'deductibleAmount',
    fieldType: 'text',
    display: true,
    dataTestId: 'insurance-deductible-amount',
  },
  {
    title: 'leadDetailFields.fireAndTheft',
    name: 'fireAndTheft',
    fieldType: 'text',
    display: true,
    dataTestId: 'insurance-fire-and-theft',
  },
  {
    title: 'leadDetailFields.adjustedPremium',
    name: 'adjustedPremium',
    fieldType: 'text',
    display: true,
    placeholder: 'Enter adjusted premium',
    isInputMasked: true,
    dataTestId: 'insurance-adjusted-premium',
    options: {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      numeralDecimalScale: 2,
      numeralDecimalMark: '.',
    },
  },
];

// NOTE: Will work on the next PR
export const readOnlyItems: IFormikControllerProps[] = [
  {
    title: 'leadDetailFields.insurer',
    name: 'insurer',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'insurance-insurer',
    display: true,
  },
  {
    title: 'text.insuranceCategory',
    name: 'insuranceType',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'insurance-insurance-type',
    display: true,
  },
  {
    title: 'text.productType',
    name: 'product',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'insurance-product',
    display: true,
  },
  {
    title: 'leadDetailFields.applicationNumber',
    name: 'applicationNumber',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'application-number',
    display: true,
    showAsterisk: false,
  },
  {
    title: 'tableListing.policyNumber',
    name: 'policyNumber',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'insurance-policy-number',
    display: true,
  },
  {
    title: 'qc.repairType',
    name: 'repairType',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'repair-type',
    display: true,
  },
  {
    title: 'leadDetailFields.packageName',
    name: 'packageName',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'insurance-package-name',
    display: true,
  },
  {
    title: 'leadDetailFields.orderNetPreium',
    name: 'netPremium',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'insurance-net-premium',
  },
  {
    title: 'leadDetailFields.orderDiscount',
    name: 'discount',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'insurance-discount',
  },
  {
    title: 'leadDetailFields.orderTotalPreium',
    name: 'grossPremium',
    fieldType: 'text',
    isReadOnly: true,
    dataTestId: 'insurance-gross-premium',
    display: true,
  },
  {
    title: 'leadDetailFields.policyDate',
    name: 'policyDate',
    fieldType: 'datefield',
    display: true,
    isReadOnly: true,
    placeholder: 'DD/MM/YYYY',
    dataTestId: 'insurance-policy-date',
  },
  {
    title: 'leadDetailFields.orderOwnCarDamage',
    name: 'ownCarDamage',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'insurance-own-car-damage',
  },
  {
    title: 'leadDetailFields.orderDeductible',
    name: 'deductibleAmount',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'insurance-deductible-amount',
  },
  {
    title: 'leadDetailFields.fireAndTheft',
    name: 'fireAndTheft',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'insurance-fire-and-theft',
  },
  {
    title: 'leadDetailFields.adjustedPremium',
    name: 'adjustedPremium',
    fieldType: 'text',
    display: true,
    placeholder: 'Enter adjusted premium',
    isInputMasked: true,
    isReadOnly: true,
    dataTestId: 'insurance-adjusted-premium',
  },
];

export const getPolicyId = (text: string) =>
  text.slice(text.lastIndexOf('/') + 1, text.length);
