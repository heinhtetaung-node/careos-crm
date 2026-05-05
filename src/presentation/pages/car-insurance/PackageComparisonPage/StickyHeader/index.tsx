import { Price } from '@alphafounders/ui';
import { ArrowLeftIcon, CloseIcon } from '@alphafounders/icons';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

import VSIcon from 'images/icons/vs-icon.svg';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import {
  getInsuranceTypeSubtitleDisplayText,
  isPackageSelected,
} from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';

import SelectPackageButton from '../SelectPackageButton';

interface StickyHeaderProps {
  onClickBack?: () => void;
  onRemove?: (index: string) => void;
  packages: TransformedPackageType[];
  selectedPackageId: string;
}

const useStyles = makeStyles((theme) => ({
  shadow: {
    boxShadow: '0px 7px 15px rgba(42, 49, 203, 0.1)',
  },
  mainContainer: {
    maxWidth: '415px',
    boxSizing: 'border-box',
    '&:nth-child(n + 3)': {
      borderLeft: `1px dashed ${theme.palette.divider}`,

      '&:before': {
        content: '""',
        background: `url(${VSIcon}) no-repeat center center, ${theme.palette.common.white}`,
        position: 'absolute',
        top: 'calc(50% - 12px)',
        left: '-12px',
        width: '24px',
        height: '24px',
        border: `2px solid ${theme.palette.common.blue}`,
        borderRadius: '6px',
      },
    },
  },
}));

const getPackageBorderColor = (packageSource: string) => {
  if (packageSource === 'import') return '';
  if (packageSource === 'custom') return 'bg-primary h-[5px]';
  if (packageSource === 'manual') return 'bg-success h-[5px]';
  if (packageSource === 'renewal_manual_quote') return 'bg-secondary h-[5px]';
  return '';
};

function StickyHeader({
  packages,
  selectedPackageId,
  onClickBack,
  onRemove,
}: Readonly<StickyHeaderProps>) {
  const classes = useStyles();

  const comparePackageEnabled = false;

  return (
    <div
      className={clsx(
        'sticky top-[64px] bg-white shadow-header -mt-[11px] z-10',
        classes.shadow,
        comparePackageEnabled ? 'pt-[15px]' : 'py-[15px]'
      )}
      data-testid="comparison-sticky-header"
    >
      <div className="container mx-auto">
        <div className="relative flex flex-row justify-center items-center">
          {onClickBack && (
            <span
              onClick={onClickBack}
              role="button"
              className="absolute top-0 left-0 z-10 flex items-center cursor-pointer"
              aria-hidden="true"
            >
              <ArrowLeftIcon />
              &nbsp;Back
            </span>
          )}
          {packages.map((data) => (
            <div
              className={`relative flex flex-col items-center justify-center flex-wrap basis-0 grow gap-4 px-[30px] max-w-[400px] ${classes.mainContainer}`}
              data-testid={`insurance-${data.id}-info`}
              key={data.title}
            >
              <div className="flex flex-row items-start justify-between flex-wrap gap-4 w-full">
                <div className="flex flex-row items-start">
                  <img
                    className="rounded-full w-[43px] h-[43px]"
                    src={data.logo}
                    alt="logo"
                  />
                  <div className="flex flex-col items-start justify-center p-0 pl-4">
                    <span>{data.title}</span>
                    <span className="font-bold text-success">
                      {getInsuranceTypeSubtitleDisplayText(data)}
                    </span>
                    <span className="flex">
                      <Price
                        className="mr-2 font-bold"
                        variant={data.hasDiscount ? 'oldPrice' : 'normal'}
                        value={
                          data.hasDiscount ? data.originalPrice : data.premium
                        }
                      />
                      {data.hasDiscount && (
                        <Price
                          className="font-bold"
                          variant="newPrice"
                          value={data.premium}
                          data-testid="discount"
                        />
                      )}
                    </span>
                  </div>
                </div>

                {onRemove && (
                  <span
                    role="button"
                    className="bg-muted-light rounded-full w-[24px] h-[24px] flex items-center justify-center cursor-pointer"
                    onClick={() => onRemove(data.id)}
                    aria-hidden="true"
                    data-testid={`insurance-${data.id}-remove`}
                  >
                    <CloseIcon />
                  </span>
                )}
              </div>
              <div className="w-full">
                <SelectPackageButton
                  packageData={data}
                  isSelected={isPackageSelected(data, selectedPackageId)}
                />
              </div>
              {comparePackageEnabled && (
                <div
                  data-testid={`package-border-color-${data.id}`}
                  key={`package-border-color-${data.id}`}
                  className={`w-full ${getPackageBorderColor(
                    data.packageSource
                  )}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StickyHeader;
