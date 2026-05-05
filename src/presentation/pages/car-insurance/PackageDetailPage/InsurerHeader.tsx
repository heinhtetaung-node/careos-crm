import {
  Button,
  Container,
  Rating,
  Badge,
  isElementInViewport,
  Price,
} from '@alphafounders/ui';
import { AddCircleIcon, CheckCircleIcon } from '@alphafounders/icons';
import { CircularProgress } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import { TransformedPackageType } from '../PackageListingPageNew/hooks/useTransformedPackages';
import {
  getInsuranceTypeSubtitleDisplayText,
  getPackageTypeLabel,
} from '../PackageListingPageNew/packageListing.helper';
import PackageTypeLabel from './PackageTypeLabel';

interface InsurerHeaderProps {
  insurancePackage: TransformedPackageType;
  isSelected: boolean;
  isSelectedForComparison: boolean;
  isSelectLoading: boolean;
  showButtons: boolean;
  onSelect: () => void;
  onCompare: () => void;
}

function InsurerHeader({
  insurancePackage,
  isSelected,
  isSelectedForComparison,
  isSelectLoading,
  showButtons,
  onSelect,
  onCompare,
}: Readonly<InsurerHeaderProps>) {
  const header = useRef<HTMLDivElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const handleScroll = () => {
    if (isElementInViewport(header)) {
      setShowStickyHeader(false);
    } else {
      setShowStickyHeader(true);
    }
  };

  const handleSelect = () => {
    if (!isSelected) {
      onSelect();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const selectText = isSelected
    ? getString('packageListing.selected')
    : getString('text.select');

  const packageTypeLabel = getPackageTypeLabel(insurancePackage.packageSource);
  const subTitle = getInsuranceTypeSubtitleDisplayText(insurancePackage);

  return (
    <div>
      {showStickyHeader && (
        <div
          className="fixed top-[64px] left-0 right-0 p-3 w-full bg-white z-10"
          data-testid="sticky-header"
        >
          <Container className="w-[900px] text-left flex justify-between">
            <div className="flex gap-2">
              <img
                className="rounded-full"
                src={insurancePackage.logo}
                alt="logo"
              />
              <div>
                <div className="text-primary font-bold text-extra-lg">
                  {insurancePackage.title}
                </div>

                <div>
                  <Rating rating={insurancePackage.rating} className="inline" />
                  <span className="inline text-success">{subTitle}</span>
                  <PackageTypeLabel label={packageTypeLabel} />
                </div>
                <div>
                  <Price
                    className={clsx('font-bold', {
                      'mr-2': insurancePackage.hasDiscount,
                    })}
                    variant={
                      insurancePackage.hasDiscount ? 'oldPrice' : 'normal'
                    }
                    value={
                      insurancePackage.hasDiscount
                        ? insurancePackage.originalPrice
                        : insurancePackage.premium
                    }
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
              </div>
            </div>
            {showButtons ? (
              <div>
                <Button
                  text={getString('packageListing.compare')}
                  onClick={onCompare}
                  icon={<AddCircleIcon className="mr-2" />}
                  variant="secondary"
                  className="p-2 m-1 w-[130px] h-[35px] text-base inline-flex align-middle hover:bg-primary-light"
                  disabled={isSelectedForComparison}
                />
                <Button
                  text={
                    isSelectLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : (
                      selectText
                    )
                  }
                  onClick={handleSelect}
                  disabled={
                    isSelectLoading ||
                    insurancePackage.customQuoteDetail?.approvalStatus ===
                      'PENDING' ||
                    insurancePackage.customQuoteDetail?.approvalStatus ===
                      'REJECTED' ||
                    !insurancePackage.customQuoteDetail
                  }
                  variant="primary"
                  className="p-2 m-1 w-[130px] h-[35px] text-base inline-flex align-middle"
                  icon={
                    isSelected && !isSelectLoading ? (
                      <CheckCircleIcon className="w-[13px] h-[13px] bg-success rounded-full p-1 mr-2" />
                    ) : undefined
                  }
                  dataTestId="select-button"
                />
              </div>
            ) : null}
          </Container>
        </div>
      )}
      <div ref={header} data-testid="normal-header">
        <Badge variant="warning">
          <div className="w-[415px] text-center">
            <img
              className="w-logo-m rounded-full"
              src={insurancePackage.logo}
              alt="logo"
            />
            <p className="text-extra-lg text-primary font-bold my-1">
              {insurancePackage.title}
            </p>
            <span className="font-bold text-success text-medium">
              {subTitle}
            </span>
            <PackageTypeLabel label={packageTypeLabel} />
            <div className="text-medium">
              <Price
                className={clsx('font-bold', {
                  'mr-2': insurancePackage.hasDiscount,
                })}
                variant={insurancePackage.hasDiscount ? 'oldPrice' : 'normal'}
                value={
                  insurancePackage.hasDiscount
                    ? insurancePackage.originalPrice
                    : insurancePackage.premium
                }
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
          </div>
        </Badge>
        {showButtons ? (
          <>
            <Button
              text={getString('packageListing.compare')}
              onClick={onCompare}
              icon={<AddCircleIcon className="mr-2" />}
              variant="secondary"
              className="p-2 m-3 w-[143px] h-[35px] text-base inline-flex align-middle hover:bg-primary-light"
              disabled={isSelectedForComparison}
            />
            <Button
              text={
                isSelectLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  selectText
                )
              }
              onClick={handleSelect}
              disabled={
                isSelectLoading ||
                insurancePackage.customQuoteDetail?.approvalStatus ===
                  'PENDING' ||
                insurancePackage.customQuoteDetail?.approvalStatus ===
                  'REJECTED' ||
                !insurancePackage.customQuoteDetail
              }
              variant="primary"
              className="p-2 m-3 w-[143px] h-[35px] text-base inline-flex align-middle"
              icon={
                isSelected && !isSelectLoading ? (
                  <CheckCircleIcon className="w-[13px] h-[13px] bg-success rounded-full p-1 mr-2" />
                ) : undefined
              }
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default InsurerHeader;
