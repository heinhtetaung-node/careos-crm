/* eslint-disable jsx-a11y/control-has-associated-label */
import { CloseIcon } from '@alphafounders/icons';
import { Price } from '@alphafounders/ui';
import clsx from 'clsx';
import React from 'react';
import { PlusCircle } from 'react-feather';

import { getString } from 'presentation/theme/localization';

import { TransformedPackageType } from '../hooks/useTransformedPackages';
import { getInsuranceTypeSubtitleDisplayText } from '../../PackageListingPageNew/packageListing.helper';

interface PackageBriefProps {
  readonly insurancePackage?: TransformedPackageType;
  readonly removePackage: (id: string) => void;
  readonly isComparePackage?: boolean;
}
function PackageBrief({
  insurancePackage,
  removePackage,
  isComparePackage = false,
}: Readonly<PackageBriefProps>) {
  if (insurancePackage) {
    return (
      <div className={clsx('flex mx-4 mt-2 items-center')}>
        <img src={insurancePackage.logo} alt="logo" className="w-9 h-9 mr-2" />
        <div>
          <div
            className={clsx('font-bold', isComparePackage && 'text-primary')}
          >
            {insurancePackage.title}
            <button
              type="button"
              className="mx-2 cursor-pointer border-none bg-transparent"
              onClick={() => removePackage(insurancePackage.id)}
              data-testid={`remove-${insurancePackage.id}`}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="text-success font-bold">
            {getInsuranceTypeSubtitleDisplayText(insurancePackage)}
          </div>
          {isComparePackage && (
            <div className="flex">
              <Price
                className="mr-2 font-bold"
                variant={insurancePackage.hasDiscount ? 'oldPrice' : 'normal'}
                value={
                  insurancePackage.hasDiscount
                    ? insurancePackage.originalPrice
                    : insurancePackage.premium
                }
                data-testid="premium-price"
              />
              {insurancePackage.hasDiscount && (
                <Price
                  className="font-bold"
                  variant="newPrice"
                  value={insurancePackage.premium}
                  data-testid="discount"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center mx-4 text-muted-dark">
      <PlusCircle className="w-9 h-9 mr-2" />
      <div>{getString('packageListing.addToCompare')}</div>
    </div>
  );
}

export default PackageBrief;
