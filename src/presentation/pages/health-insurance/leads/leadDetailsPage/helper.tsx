import { PRODUCTS } from 'config/TypeFilter';
import { camelCase } from 'lodash';
import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';

export const isHealthLead = (lead?: Lead) =>
  lead?.product === undefined ||
  lead?.product === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

export const healthInsurerTypeOptions = [
  {
    id: 0,
    title: 'Type 1',
    value: 'type_1',
  },
  {
    id: 1,
    title: 'Type 2',
    value: 'type_2',
  },
];

export function getDeliveryOptionName(deliveryOption: string | undefined) {
  if (!deliveryOption) return '-';

  const deliveryTitle = deliveryOption.split('/');
  return getString(`qc.${camelCase(deliveryTitle[deliveryTitle.length - 1])}`);
}

export const UnderwritingStatusOption = () => [
  {
    id: 2,
    title: getString('underwritingStatus.PENDING_VALIDATION'),
    label: getString('underwritingStatus.PENDING_VALIDATION'),
    value: 'ITEM_UNDERWRITING_STATUS_PENDING_VALIDATION',
  },
  {
    id: 3,
    title: getString('underwritingStatus.PENDING_FIX'),
    label: getString('underwritingStatus.PENDING_FIX'),
    value: 'ITEM_UNDERWRITING_STATUS_PENDING_FIX',
  },
  {
    id: 4,
    title: getString('underwritingStatus.PENDING_SUBMISSION'),
    label: getString('underwritingStatus.PENDING_SUBMISSION'),
    value: 'ITEM_UNDERWRITING_STATUS_PENDING_SUBMISSION',
  },
  {
    id: 5,
    title: getString('underwritingStatus.PENDING_APPROVAL'),
    label: getString('underwritingStatus.PENDING_APPROVAL'),
    value: 'ITEM_UNDERWRITING_STATUS_PENDING_APPROVAL',
  },
  {
    id: 6,
    title: getString('underwritingStatus.PENDING_RECEPTION'),
    label: getString('underwritingStatus.PENDING_RECEPTION'),
    value: 'ITEM_UNDERWRITING_STATUS_PENDING_RECEPTION',
  },
  {
    id: 7,
    title: getString('underwritingStatus.PENDING_SHIPMENT'),
    label: getString('underwritingStatus.PENDING_SHIPMENT'),
    value: 'ITEM_UNDERWRITING_STATUS_PENDING_SHIPMENT',
  },
  {
    id: 8,
    title: getString('underwritingStatus.SHIPPED'),
    label: getString('underwritingStatus.SHIPPED'),
    value: 'ITEM_UNDERWRITING_STATUS_SHIPPED',
  },
  {
    id: 9,
    title: getString('underwritingStatus.REJECTED'),
    label: getString('underwritingStatus.REJECTED'),
    value: 'ITEM_UNDERWRITING_STATUS_REJECTED',
  },
  {
    id: 10,
    title: getString('underwritingStatus.COMPLETE'),
    label: getString('underwritingStatus.COMPLETE'),
    value: 'ITEM_UNDERWRITING_STATUS_COMPLETE',
  },
];

export const hasPackageSearchRequiredFields = (leadData: any) => {
  if (leadData === undefined) return false;

  const requiredFields: any[] = []; // will be added later
  let hasField = true;

  requiredFields.forEach((field) => {
    if (
      !Object.prototype.hasOwnProperty.call(leadData, field) ||
      leadData[field] === ''
    ) {
      hasField = false;
    }
  });

  return hasField;
};
