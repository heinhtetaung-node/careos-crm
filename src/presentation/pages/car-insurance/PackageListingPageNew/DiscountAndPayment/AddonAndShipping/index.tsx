import { DisplayTable } from '@alphafounders/ui';
import React, { useEffect, useMemo } from 'react';

import { UserRoles } from 'config/constant';
import { getString } from 'presentation/theme/localization';

import {
  addonOptionTableConfig,
  formatPrice,
  mockAddons,
  shippingOptionTableConfig,
  useGetShippingOptions,
} from './helper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import clsx from 'clsx';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

interface AddonAndShippingProps {
  policyType?: 'customer' | 'company' | 'straw_buyer'; // 'customer' | 'straw_buyer' are treated as Person
  insuranceKind: 'mandatory' | 'voluntary' | 'both';
  showAddon?: boolean;
  selectedAddon: string[];
  deliveryOption: string;
  handleAddonSelect: (val: string[]) => void;
  handleDeliveryOptionChange: (value: string) => void;
  insurerName?: string; // Insurer name to check for Navakij or Tokio
}

function AddonAndShipping({
  policyType,
  insuranceKind,
  selectedAddon,
  handleAddonSelect,
  deliveryOption,
  handleDeliveryOptionChange,
  showAddon = true,
  insurerName,
}: AddonAndShippingProps) {
  const enableAddons = false;

  const flags = useFlags([
    FeatureFlags.BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP,
  ]);
  const isPolicyOptionPreselectFlag =
    flags[FeatureFlags.BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP]
      ?.enabled ?? false;

  const { shippingOptions, isLoading } = useGetShippingOptions({});
  const currentUser = useGetUserSelector();
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const isCarInsurance = globalProduct === 'products/car-insurance';

  const isSaleAgentOrSupervisor =
    currentUser?.role === UserRoles.SALE_ROLE ||
    currentUser?.role === UserRoles.SUPERVISOR_ROLE;

  const isPerson = policyType === 'customer' || policyType === 'straw_buyer';
  const isCompany = policyType === 'company';
  const isPersonOrCompany = isPerson || isCompany;

  const isNavakijOrTokio = useMemo(() => {
    if (!insurerName) return false;
    const insurerLower = insurerName.toLowerCase();
    return insurerLower.includes('navakij') || insurerLower.includes('tokio');
  }, [insurerName]);

  const preselectedShippingOption = useMemo(() => {
    if (!shippingOptions || shippingOptions.length === 0) return null;

    // Condition 0: policy delivery to digital when policy holder type is not selected
    if (!policyType) {
      return (
        shippingOptions.find(
          (opt) => opt.key === 'deliveryOptions/digital-delivery'
        )?.key || null
      );
    }

    // Condition 1 & 2: Person + (Voluntary + Mandatory OR Voluntary) → Digital
    if (
      isPerson &&
      (insuranceKind === 'both' || insuranceKind === 'voluntary')
    ) {
      return (
        shippingOptions.find(
          (opt) => opt.key === 'deliveryOptions/digital-delivery'
        )?.key || null
      );
    }

    // Condition 3 & 7: Person or company + Mandatory + NOT (Navakij OR Tokio) → Standard
    if (
      isPersonOrCompany &&
      insuranceKind === 'mandatory' &&
      !isNavakijOrTokio
    ) {
      return (
        shippingOptions.find(
          (opt) => opt.key === 'deliveryOptions/kerry-standard'
        )?.key || null
      );
    }

    // Condition 4 & 8: Person or company + Mandatory + (Navakij OR Tokio) → Digital
    if (
      isPersonOrCompany &&
      insuranceKind === 'mandatory' &&
      isNavakijOrTokio
    ) {
      return (
        shippingOptions.find(
          (opt) => opt.key === 'deliveryOptions/digital-delivery'
        )?.key || null
      );
    }

    // Condition 5 & 6: Company + (Voluntary + Mandatory OR Voluntary) → Standard
    if (
      isCompany &&
      (insuranceKind === 'both' || insuranceKind === 'voluntary')
    ) {
      return (
        shippingOptions.find(
          (opt) => opt.key === 'deliveryOptions/kerry-standard'
        )?.key || null
      );
    }

    return null;
  }, [
    policyType,
    isPerson,
    isCompany,
    insuranceKind,
    isNavakijOrTokio,
    shippingOptions,
  ]);

  // Preselect shipping option when conditions are met and no option is currently selected
  useEffect(() => {
    if (
      preselectedShippingOption &&
      shippingOptions.length > 0 &&
      isPolicyOptionPreselectFlag &&
      isCarInsurance
    ) {
      handleDeliveryOptionChange(preselectedShippingOption);
    }
  }, [preselectedShippingOption, isPolicyOptionPreselectFlag]);

  const addons = mockAddons.map((addon) => ({
    key: addon.name,
    addon,
    price: formatPrice(addon.price),
  }));

  const onAddonChange = (val: string) => {
    if (selectedAddon.includes(val)) {
      handleAddonSelect(selectedAddon.filter((addon) => addon !== val));
    } else {
      handleAddonSelect([...selectedAddon, val]);
    }
  };

  const isNotAllowToEditShippingOption = isSaleAgentOrSupervisor
    ? isCarInsurance &&
      isPolicyOptionPreselectFlag &&
      !(
        preselectedShippingOption === 'deliveryOptions/kerry-standard' &&
        window.location.pathname.includes('/leads/')
      )
    : false;

  return (
    <div className="flex w-full">
      {enableAddons && showAddon && (
        <div className="w-1/2 p-6" data-testid="addon">
          <span className="font-bold text-lg text-primary">
            {getString('text.addOns')}
          </span>
          <DisplayTable
            selectionType="checkbox"
            tableConfig={addonOptionTableConfig}
            selectedDataKey={selectedAddon}
            data={addons}
            onSelect={(val) => onAddonChange(val.key)}
            gap
          />
        </div>
      )}
      <div
        className={clsx(`w-1/2 p-6`, [
          isNotAllowToEditShippingOption &&
            'pointer-events-none cursor-not-allowed',
        ])}
        data-testid="addon-shipping"
      >
        <span className="font-bold text-lg text-primary">
          {getString('qc.shipping')}
        </span>
        <DisplayTable
          selectionType="radio"
          tableConfig={shippingOptionTableConfig}
          selectedDataKey={deliveryOption}
          data={shippingOptions.filter((opt) =>
            globalProduct === 'products/health-insurance'
              ? opt.key !== 'deliveryOptions/kerry-express-dashcam'
              : true
          )}
          onSelect={(d) => {
            if (isNotAllowToEditShippingOption) {
              return;
            }
            handleDeliveryOptionChange(d.key);
          }}
          loading={isLoading}
          gap
        />
        <span>**{getString('text.recommended')}</span>
      </div>
    </div>
  );
}

export default AddonAndShipping;
