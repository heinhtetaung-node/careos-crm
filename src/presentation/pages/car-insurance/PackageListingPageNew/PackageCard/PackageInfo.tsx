import { Price } from '@alphafounders/ui';
import _camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo } from 'react';

import { getString } from 'presentation/theme/localization';

import PackageInfoSection from './PackageInfoSection';
import PriceBreakDown from './PriceBreakdown';
import { EditOutlineIcon } from '@alphafounders/icons';

import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';

interface PackageInfoProps {
  insurancePackage: TransformedPackageType;
  onClickPaymentSchedule?: () => void;
  disabled?: boolean;
}

function PackageInfo({
  insurancePackage,
  onClickPaymentSchedule,
  disabled,
}: Readonly<PackageInfoProps>) {
  const handleClickPayment = useCallback(
    (e: React.MouseEvent) => {
      if (!disabled) {
        e.stopPropagation();
        onClickPaymentSchedule?.();
      }
    },
    [disabled, onClickPaymentSchedule]
  );

  const renderPackageInsuranceType = useMemo(() => {
    if (insurancePackage?.carInsuranceType)
      return insurancePackage.carInsuranceType;

    return insurancePackage.insuranceKind === 'both' &&
      !['TYPE_610', 'TYPE_620'].includes((insurancePackage as any)?.oicCode)
      ? `${getString(insurancePackage.subtitle)} ${getString(
          'packageListing.values.insuranceType.mandatory'
        )}`
      : getString(insurancePackage.subtitle);
  }, [insurancePackage]);

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2">
        <PackageInfoSection
          title={getString('packageListing.insuranceType')}
          childProps={{ className: 'text-success' }}
        >
          {renderPackageInsuranceType}
        </PackageInfoSection>
      </div>
      <div className="col-span-2">
        <PackageInfoSection title={getString('packageListing.repairType')}>
          {insurancePackage.repairType
            ? getString(insurancePackage.repairType)
            : '-'}
        </PackageInfoSection>
      </div>
      <div className="col-span-3">
        <PackageInfoSection title={getString('packageListing.carCoverage')}>
          {insurancePackage.sumCoverage}
          <div className="text-base font-normal">
            {getString('packageListing.thbPYear')}
          </div>
        </PackageInfoSection>
      </div>
      <div className="col-span-3">
        <PackageInfoSection title={getString('packageListing.payment')}>
          <div>
            <div
              className="flex item-center hover:underline"
              onClickCapture={handleClickPayment}
              data-testid="installment-info"
            >
              <p className="text-base mt-0 mb-0 text-primary inline">
                {(insurancePackage.customQuoteDetail?.priceBreakDown
                  ?.numberOfMonths ?? 0) > 1
                  ? getString('packageListing.xMonth', {
                      x: insurancePackage.customQuoteDetail?.priceBreakDown
                        ?.numberOfMonths,
                    })
                  : getString('packageListing.oneTime')}
              </p>
              <EditOutlineIcon className="inline" />
            </div>
            {insurancePackage.customQuoteDetail?.paymentMethod && (
              <span className="text-sm font-normal">
                {getString(
                  `discountPricing.${_camelCase(
                    insurancePackage.customQuoteDetail?.paymentMethod
                  )}`
                )}
              </span>
            )}
          </div>
        </PackageInfoSection>
      </div>
      <div className="col-span-2">
        <PackageInfoSection title={getString('packageListing.price')}>
          <div className="flex flex-wrap">
            <Price
              className="mr-2"
              variant={insurancePackage.hasDiscount ? 'oldPrice' : 'normal'}
              value={
                insurancePackage.hasDiscount
                  ? insurancePackage.originalPrice
                  : insurancePackage.premium
              }
            />
            {insurancePackage.hasDiscount && (
              <Price
                variant="newPrice"
                value={insurancePackage.premium}
                data-testid="discount"
              />
            )}
          </div>
          <div className="text-base font-normal">
            {getString('packageListing.thbPYear')}
          </div>
          <PriceBreakDown insurancePackage={insurancePackage} />
        </PackageInfoSection>
      </div>
    </div>
  );
}

export default PackageInfo;
