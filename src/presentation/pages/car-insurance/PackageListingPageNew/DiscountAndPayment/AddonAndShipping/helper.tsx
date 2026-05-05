import _get from 'lodash/get';
import React from 'react';

import { useGetDeliveryOptionsQuery } from 'data/slices/deliveryOptionSlice';
import { checkKeyExist, getString } from 'presentation/theme/localization';
import { ShipmentProviders } from 'shared/constants/orderType';
import { Addon } from 'shared/types/addons';
import { formatSatangToBaht } from 'utils/currency';

import AddonDetail from './AddonDetail';

export interface ShippingFeeProps {
  key: string;
  name: string;
  price: string;
  shipmentFee: string;
}

export const shippingOptionTableConfig = [
  {
    title: getString('discountPricing.pricingHeader.plans'),
    key: 'plans',
    dataIndex: 'name',
    width: '80%',
    className: 'font-bold text-center',
  },
  {
    title: getString('package.priceSearchLabel'),
    key: 'price',
    width: '20%',
    className: 'font-bold text-center',
    render: ({ price }: { price: string }) => (
      <span className="text-right w-full">{price}</span>
    ),
  },
];

export const addonOptionTableConfig = [
  {
    title: getString('discountPricing.pricingHeader.plans'),
    key: 'plans',
    dataIndex: 'name',
    width: '50%',
    className: 'font-bold text-center',
    render: ({ addon }: { addon: Addon }) => <AddonDetail addon={addon} />,
  },
  {
    title: getString('package.priceSearchLabel'),
    key: 'price',
    width: '50%',
    className: 'font-bold text-center',
    render: ({ price }: { price: string }) => (
      <span className="text-right w-full">{price}</span>
    ),
  },
];

const shippingOptionTranslation = {
  [ShipmentProviders.EMAIL]: 'shipping.digitalDelivery',
  [ShipmentProviders.COURIER_PROVIDER_KERRY]: 'shipping.kerryStandard',
  [ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS]: 'shipping.kerryExpress',
  [ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS_DASHCAM]:
    'shipping.kerryExpressDashcam',
};

export const getTranslatedShippingOption = ({
  displayName,
  name,
}: {
  displayName: string;
  name: string;
}) => {
  const transKey = _get(shippingOptionTranslation, name);
  return checkKeyExist(transKey) ? getString(transKey) : displayName;
};

export const formatPrice = (price: string) => {
  const priceBaht = formatSatangToBaht(price);
  return parseFloat(price) > 0 ? `+${priceBaht}` : priceBaht;
};

export function useGetShippingOptions(options: {
  restOptions?: void;
  skip?: boolean;
}) {
  const { data: shippingOptionResponse, isLoading } =
    useGetDeliveryOptionsQuery(options?.restOptions, {
      skip: options?.skip ?? false,
    });

  const shippingOptions: ShippingFeeProps[] = (
    shippingOptionResponse?.deliveryOptions ?? []
  ).map((opt) => ({
    key: opt.name,
    name: getTranslatedShippingOption(opt),
    price: formatPrice(opt.shipmentFee),
    shipmentFee: opt.shipmentFee,
  }));

  return {
    isLoading,
    shippingOptions,
  };
}

export const mockAddons = [
  {
    name: 'addons/roadsideAssistance',
    displayName: 'Roadside Assitance',
    price: '29900',
    addonType: 'roadside-assistance',
    scopes: [
      {
        displayNameEn: 'Roadside emergency towing',
        displayNameTh: 'บริการขนส่งยานพาหนะ',
        term: '5 times/year',
      },
      {
        displayNameEn: 'Emergency roadside repair',
        displayNameTh: 'การช่วยเหลือซ่อมแซมฉุกเฉิน',
        term: 'unlimited',
      },
      {
        displayNameEn: 'Emergency gas refill',
        displayNameTh: 'การช่วยเหลือเติมน้ำมัน',
        term: 'unlimited',
      },
    ],
    coverages: {},
    termsAndConditions: {
      en: ['term and condition 1', 'term and condition 2'],
      th: ['term and condition 1th', 'term and condition 2th'],
    },
    provider: {
      displayNameEn: 'Inter Partner Assistance (IPA)',
      displayNameTh: 'บริษัท อินเตอร์ พาร์ทเนอร์ แอสซิสแต้นซ์ จำกัด',
    },
  },
  {
    name: 'addons/assetInsurance',
    displayName: 'Rabbit Asset Insurance',
    price: '29900',
    addonType: 'asset',
    coverages: {
      coverage: [
        {
          displayNameEn: 'In-car asset theft coverage',
          displayNameTh:
            'การประกันภัยโจรกรรมสำหรับทรัพย์สินส่วนบุคคลที่อยู่ภายในรถยนต์ (จ่ายตามจริงไม่เกิน)',
          price: '2000000',
        },
        {
          displayNameEn: 'In-car asset theft coverage (if car got stolen)',
          displayNameTh: 'กรณีรถยนต์หายจากการถูกโจรกรรมจ่ายเป็น 2 เท่า',
          price: '4000000',
        },
      ],
    },
    termsAndConditions: {
      en: ['term and condition 1', 'term and condition 2'],
      th: ['term and condition 1th', 'term and condition 2th'],
    },
    provider: {
      displayNameEn: 'Bangkok Insurance',
      displayNameTh: 'กรุงเทพประกันภัย',
    },
  },
  {
    name: 'addons/carRepalcement',
    displayName: 'Rabbit Car Replacement',
    addonType: 'car-replacement',
    price: '99000',
    scopes: [
      {
        displayNameEn: 'Car replacement (free-of-charge)',
        displayNameTh: 'บริการรถทดแทนระหว่างซ่อม',
        term: 'upto 15 days',
      },
    ],
    coverages: {},
    termsAndConditions: {
      en: ['term and condition 1', 'term and condition 2'],
      th: ['term and condition 1th', 'term and condition 2th'],
    },
    provider: {
      displayNameEn: 'Hertz Thailand',
      displayNameTh: 'เฮิร์ซ ประเทศไทย',
    },
  },
];
