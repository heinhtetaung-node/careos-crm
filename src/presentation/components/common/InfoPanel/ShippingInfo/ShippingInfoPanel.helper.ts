import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';

export const isPolicyModify = (
  isVoluntary: boolean,
  values: Record<string, any>,
  policyState: Record<string, any>
): boolean => {
  if (values?.trackingNum !== policyState.trackingNumber) return true;
  if (isVoluntary && values.voluntaryPolicyNum !== policyState.policyNumber)
    return true;
  if (!isVoluntary && values.mandatoryPolicyNum !== policyState.policyNumber)
    return true;
  return false;
};

export const companyItem: IFormikControllerProps[] = [
  {
    title: 'text.companyName',
    name: 'companyName',
    fieldType: 'text',
    dataTestId: 'shipping-company-name',
    display: true,
    placeholder: getString('text.enterFieldPlaceholder', {
      field: getString('text.companyName').toLocaleLowerCase(),
    }),
  },
];

export const shippingMandatoryPolicyNum: IFormikControllerProps = {
  title: 'order.shipping.mandatoryPolicyNum',
  name: 'mandatoryPolicyNum',
  fieldType: 'text',
  dataTestId: 'shipping-mandatory-policy-num',
  display: true,
  placeholder: getString('text.enterFieldPlaceholder', {
    field: getString('order.shipping.mandatoryPolicyNum').toLocaleLowerCase(),
  }),
};

export const shippingVoluntaryPolicyNum: IFormikControllerProps = {
  title: 'order.shipping.voluntaryPolicyNum',
  name: 'voluntaryPolicyNum',
  fieldType: 'text',
  dataTestId: 'shipping-mandatory-policy-num',
  display: true,
  placeholder: getString('text.enterFieldPlaceholder', {
    field: getString('order.shipping.voluntaryPolicyNum').toLocaleLowerCase(),
  }),
};

export const shippingTrackingNum: IFormikControllerProps = {
  title: 'order.shipping.trackingNum',
  name: 'trackingNum',
  fieldType: 'text',
  dataTestId: 'shipping-tracking-num',
  display: true,
  isReadOnly: true,
};

export const shippingAddressItems: IFormikControllerProps[] = [
  {
    title: 'text.address',
    name: 'address',
    fieldType: 'text',
    dataTestId: 'shipping-address',
    display: true,
    placeholder: getString('text.enterFieldPlaceholder', {
      field: getString('text.address').toLocaleLowerCase(),
    }),
  },
  {
    title: 'text.province',
    name: 'province',
    fieldType: 'province',
    dataTestId: 'shipping-province',
    display: true,
  },
  {
    title: 'text.district',
    name: 'district',
    fieldType: 'district',
    dataTestId: 'shipping-district',
    display: true,
  },
  {
    title: 'text.subDistrict',
    name: 'subDistrict',
    fieldType: 'subDistrict',
    dataTestId: 'shipping-subDistrict',
    display: true,
  },
  {
    title: 'text.postcode',
    name: 'postcode',
    fieldType: 'text',
    dataTestId: 'shipping-postcode',
    display: true,
    isReadOnly: true,
  },
];

export const shippingMandatoryPolicyNumReadOnly: IFormikControllerProps = {
  title: 'order.shipping.mandatoryPolicyNum',
  name: 'mandatoryPolicyNum',
  fieldType: 'text',
  dataTestId: 'shipping-mandatory-policy-num',
  display: true,
  isReadOnly: true,
};

export const shippingVoluntaryPolicyNumReadOnly: IFormikControllerProps = {
  title: 'order.shipping.voluntaryPolicyNum',
  name: 'voluntaryPolicyNum',
  fieldType: 'text',
  dataTestId: 'shipping-mandatory-policy-num',
  display: true,
  isReadOnly: true,
};

export const shippingTrackingNumReadOnly: IFormikControllerProps = {
  title: 'order.shipping.trackingNum',
  name: 'trackingNum',
  fieldType: 'text',
  dataTestId: 'shipping-tracking-num',
  display: true,
  isReadOnly: true,
};

export const shipmentFeeReadOnly: IFormikControllerProps = {
  title: 'text.shipmentFee',
  name: 'shipmentFee',
  fieldType: 'text',
  dataTestId: 'shipment-fee',
  display: true,
  isReadOnly: true,
};

export const shippingAddressItemsReadOnly: IFormikControllerProps[] = [
  {
    title: 'text.address',
    name: 'address',
    fieldType: 'text',
    dataTestId: 'shipping-address',
    display: true,
    isReadOnly: true,
  },
  {
    title: 'text.province',
    name: 'province',
    fieldType: 'text',
    dataTestId: 'shipping-province',
    display: true,
    isReadOnly: true,
  },
  {
    title: 'text.district',
    name: 'district',
    fieldType: 'text',
    dataTestId: 'shipping-district',
    display: true,
    isReadOnly: true,
  },
  {
    title: 'text.subDistrict',
    name: 'subDistrict',
    fieldType: 'text',
    dataTestId: 'shipping-subDistrict',
    display: true,
    isReadOnly: true,
  },
  {
    title: 'text.postcode',
    name: 'postcode',
    fieldType: 'text',
    dataTestId: 'shipping-postcode',
    display: true,
    isReadOnly: true,
  },
];
