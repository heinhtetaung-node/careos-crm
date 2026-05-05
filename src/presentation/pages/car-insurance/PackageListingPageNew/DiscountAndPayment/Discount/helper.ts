import { number, object, string } from 'yup';

import { getString } from 'presentation/theme/localization';
import { ShipmentProviders } from 'shared/constants/orderType';
import { formatBahtToSatang } from 'utils/currency';

import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';

export interface SelectedDiscountInfo {
  deliveryOption?: ShipmentProviders;
}

export enum DiscountType {
  carDiscount = 'car_discount',
  agentDiscount = 'agent_discount',
  campaignDiscount = 'campaign_discount',
  matchPrice = 'match_price_discount',
  selfRenewal = 'Self-Renewal',
  none = 'none',
}
const discountTypes = [
  {
    id: 0,
    value: DiscountType.none,
    title: 'discountPricing.discountType.none',
  },
  {
    id: 1,
    value: DiscountType.carDiscount,
    title: 'discountPricing.discountType.carDiscount',
  },
  {
    id: 2,
    value: DiscountType.agentDiscount,
    title: 'discountPricing.discountType.agentDiscount',
  },
  {
    id: 3,
    value: DiscountType.campaignDiscount,
    title: 'discountPricing.discountType.campaign',
  },
  {
    id: 4,
    value: DiscountType.matchPrice,
    title: 'discountPricing.discountType.matchPrice',
  },
];

function convertValueTo(type: string, value: number, totalAmount: string) {
  const parsedTotalAmount = Number(formatBahtToSatang(totalAmount) ?? 0) / 100;

  if (type === 'amount') {
    return parseFloat(((value / 100) * parsedTotalAmount).toFixed(2));
  }
  if (type === 'percent') {
    return parseFloat(((value * 100) / parsedTotalAmount).toFixed(2));
  }
  return value;
}

export { convertValueTo, discountTypes };

export const checkPaymentValidation = object().shape({
  discountType: string().required(),
  campaignName: string().when('discountType', ([discountType], schema) =>
    discountType === DiscountType.carDiscount
      ? schema.optional().nullable()
      : schema.required()
  ),
  discountPercent: number().when('discountType', ([discountType], schema) =>
    discountType === DiscountType.carDiscount
      ? schema.optional().nullable()
      : schema.required().typeError(getString('errors.invalidData'))
  ),
  discountAmount: number().when('discountType', ([discountType], schema) =>
    discountType === DiscountType.carDiscount
      ? schema.optional().nullable()
      : schema.required().typeError(getString('errors.invalidData'))
  ),
});

export const discountTypeNoneAlias = ['', undefined, 'DISCOUNT_TYPE_RCL'];

export const getCheckPaymentOptionDiscountParams = ({
  discountType,
  amount,
  percentage,
}: {
  discountType: string;
  amount?: string;
  percentage?: string;
}) => {
  if (
    discountType === DiscountType.none ||
    !(Object.values(DiscountType) as string[]).includes(discountType)
  ) {
    return {
      'discount.discountType': 'none',
      'discount.amount': '0',
      'discount.percentage': '0',
    };
  }
  return {
    'discount.discountType': discountType,
    'discount.amount': amount ?? '0',
    'discount.percentage': percentage ?? '0',
  };
};

export const getDiscountParameterFromExistingCustomPackage = (
  customQuoteDetail: TransformedPackageType['customQuoteDetail']
) =>
  getCheckPaymentOptionDiscountParams({
    discountType: customQuoteDetail?.discountType ?? '',
    amount:
      customQuoteDetail?.discountRequest?.discountAmount?.toString() ?? '0',
    percentage:
      customQuoteDetail?.discountRequest?.discountPercentage?.toString() ?? '0',
  });

export const mapDiscountType = (discountType = '') => {
  if ((Object.values(DiscountType) as string[]).includes(discountType)) {
    return discountType;
  }
  return DiscountType.none;
};

export const checkCampaignDiscountError = (
  maxDiscount: number,
  requestedDiscount: number,
  discountType: string
) => {
  if (discountType === DiscountType.campaignDiscount) {
    return requestedDiscount > maxDiscount
      ? getString('text.maximumDiscountExceed')
      : '';
  }
  return '';
};
