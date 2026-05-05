import { Divider } from '@alphafounders/ui';
import { DownloadFileIcon, FileCopyIcon } from '@alphafounders/icons';
import {
  Tooltip as MuiTooltip,
  withStyles,
  CircularProgress,
} from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { useParams } from 'react-router-dom';

import useCopyLink from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useCopyLink';
import { getString } from 'presentation/theme/localization';
import { formatDDMMYYYY } from 'shared/helper/utilities';

import PackageInfoTooltip from './PackageInfoTooltip';

import useGenerateQuotation from '../hooks/useGenerateQuotation';
import { TransformedPackageType } from '../hooks/useTransformedPackages';
import { GeneratedApiReponse } from '../packageListing.helper';

const Tooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: 'white',
    padding: 0,
    maxWidth: 'fit-content',
  },
  arrow: {
    color: 'white',
  },
}))(MuiTooltip);

interface InsurerLogoProps {
  insurancePackage: TransformedPackageType;
  generatedApiResponse?: GeneratedApiReponse;
  disabled?: boolean;
  noDownload?: boolean;
  noCopyLink?: boolean;
}

function InsurerLogo({
  insurancePackage,
  generatedApiResponse,
  disabled,
  noDownload,
  noCopyLink,
}: Readonly<InsurerLogoProps>) {
  const params = useParams<{ id: string }>();

  const { generateQuotation, isLoading } = useGenerateQuotation();
  const { copyLink, isGeneratingLink } = useCopyLink();

  const handleCopyLink = async (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!isGeneratingLink && !disabled) {
      copyLink({
        lead: `leads/${params.id}`,
        action: 'details',
        carInsurancePackageFilter: generatedApiResponse,
      });
    }
  };

  const handleDownloadQuotation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!isLoading && !disabled) {
      generateQuotation({
        leadId: `leads/${params.id}`,
        carInsuranceQuotationFilter: generatedApiResponse,
      });
    }
  };

  const formattedExpiryDate = insurancePackage?.expireTime
    ? formatDDMMYYYY(String(insurancePackage.expireTime))
    : '';

  const termsAndConditionsText =
    insurancePackage?.termsAndConditions ||
    getString('newPackageListing.termsAndConditionsFallback');

  return (
    <div className="p-2 flex">
      <div className="inline-block w-[40px] pr-3">
        <img src={insurancePackage.logo} alt="logo" className="w-10 mt-1" />
      </div>
      <div className="inline-block w-3/5 pl-1 align-top mr-2">
        <Tooltip
          title={
            <PackageInfoTooltip
              name={insurancePackage?.displayName}
              expiryDate={formattedExpiryDate}
              termsAndConditions={termsAndConditionsText}
            />
          }
          interactive
          placement="bottom-start"
          arrow
          disableHoverListener={
            disabled ||
            insurancePackage.packageSource === 'renewal_manual_quote'
          }
        >
          <p className="m-0 text-black text-lg font-bold break-words">
            {insurancePackage?.title}
          </p>
        </Tooltip>
        {!noDownload && (
          <div
            className={clsx(
              'text-base mt-2 hover:cursor-pointer hover:underline',
              { 'text-muted-dark': disabled, 'text-primary': !disabled }
            )}
            onClickCapture={handleDownloadQuotation}
            role="button"
            tabIndex={0}
          >
            {isLoading ? (
              <CircularProgress
                color="inherit"
                size={24}
                className="w-[20px] h-[20px] mr-1"
              />
            ) : (
              <DownloadFileIcon className="w-[20px] h-[20px] mr-1" />
            )}
            {getString('text.download')}
          </div>
        )}
        {!noCopyLink && (
          <div
            className={clsx(
              'text-base mt-1 hover:cursor-pointer hover:underline z-10',
              { 'text-muted-dark': disabled, 'text-primary': !disabled }
            )}
            onClick={handleCopyLink}
            role="presentation"
            data-testid={`copy-link-${insurancePackage.id}`}
          >
            {isGeneratingLink ? (
              <CircularProgress
                color="inherit"
                size={20}
                className="w-[20px] h-[20px] mr-1"
              />
            ) : (
              <FileCopyIcon className="w-[20px] h-[20px] mr-1" />
            )}
            {getString('packageListing.copyLink')}
          </div>
        )}
      </div>
      <Divider orientation="vertical" pattern="dash" variant="secondary" />
    </div>
  );
}

export default InsurerLogo;
