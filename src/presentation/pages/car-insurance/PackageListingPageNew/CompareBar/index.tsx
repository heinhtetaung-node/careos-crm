import { Button, Divider } from '@alphafounders/ui';
import { DownloadFileIcon, FileCopyIcon } from '@alphafounders/icons';
import { insertInterval } from '@careos/utils';
import { CircularProgress } from '@material-ui/core';
import { useFlags } from 'flagsmith/react';
import clsx from 'clsx';
import { omit } from 'lodash';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FeatureFlags from 'config/flagsmithConfig';

import { getPackageComparisonlUrl } from 'presentation/routes/Urls';
import { getString } from 'presentation/theme/localization';
import { formatBahtToSatang } from 'utils/currency';

import PackageBrief from './PackageBrief';

import useCopyLink from '../hooks/useCopyLink';
import useGenerateQuotation from '../hooks/useGenerateQuotation';
import { StorageType } from '../hooks/usePackageStorage';
import { TransformedPackageType } from '../hooks/useTransformedPackages';
import { FilterInterface } from '../PackageFilter/interface';
import {
  CommonPayload,
  generateDiscountPricingApiPayload,
  generateLendingApiPayload,
} from '../../PackageListingPageNew/packageListing.helper';

const COMPARISON_PACKAGE_LIMIT_MIN = 2;

interface CompareBarProps {
  packages: TransformedPackageType[];
  savePackages: StorageType[];
  useMultipleSuminsured: boolean;
  filter: FilterInterface;
  removePackage: (id: string) => void;
  maxCompareLimit?: number;
}

function CompareBar({
  packages,
  savePackages,
  useMultipleSuminsured,
  filter,
  removePackage,
  maxCompareLimit,
}: CompareBarProps) {
  const packageNames = useMultipleSuminsured
    ? savePackages.map((pkg) => pkg.name)
    : packages.map((pkg) => pkg.id);

  const comparePackageEnabled = false;

  const flags = useFlags([
    FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP,
    FeatureFlags.BROK_5517_ENABLE_3_PACKAGE_COMPARISON_20260420_TEMP,
  ]);
  const isCopyLinkEnabled =
    flags[FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP]?.enabled ??
    false;
  const is3PackageEnabled =
    flags[FeatureFlags.BROK_5517_ENABLE_3_PACKAGE_COMPARISON_20260420_TEMP]
      ?.enabled ?? false;

  const effectiveMaxLimit = maxCompareLimit ?? (is3PackageEnabled ? 3 : 2);

  const disabledBtns = comparePackageEnabled
    ? !packageNames.length ||
      packageNames.length < COMPARISON_PACKAGE_LIMIT_MIN ||
      packageNames.length > effectiveMaxLimit
    : packageNames.length < COMPARISON_PACKAGE_LIMIT_MIN ||
      packageNames.length > effectiveMaxLimit;

  const { id: leadId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const filterData = generateLendingApiPayload({
    packages: packageNames,
    insuranceKind: filter?.insuranceCategory,
    sumInsuredMin: filter?.isDefaultSumInsured
      ? undefined
      : formatBahtToSatang(filter?.sumInsured?.min),
    sumInsuredMax: filter?.isDefaultSumInsured
      ? undefined
      : formatBahtToSatang(filter?.sumInsured?.max),
    paymentOption: 'FULL_PAYMENT',
    installment: 1,
  });

  const { generateQuotation, isLoading } = useGenerateQuotation();
  const { copyLink, isGeneratingLink } = useCopyLink();

  const rawData: CommonPayload[] = [];
  packages.forEach((packageData) => {
    const {
      paymentOption: customPaymentOption,
      paymentMethod: customPaymentMethod,
      numberOfInstallments: customInstallments,
    } = packageData?.customQuoteDetail ?? {};

    rawData.push({
      package: packageData.id,
      insuranceKind: packageData.insuranceKind || filter.insuranceCategory,
      sumInsuredMin: filter.isDefaultSumInsured
        ? undefined
        : filter.sumInsured?.min,
      sumInsuredMax: filter.isDefaultSumInsured
        ? undefined
        : filter.sumInsured?.max,
      paymentOption: customPaymentOption,
      paymentMethod: customPaymentMethod || undefined,
      installment: customInstallments,
    });
  });

  const apiPayload = generateDiscountPricingApiPayload(rawData);

  const handleDownloadQuotation = () => {
    generateQuotation({
      leadId: `leads/${leadId}`,
      carInsuranceQuotationFilter: apiPayload,
    });
  };

  const handleClickCompare = () => {
    if (disabledBtns) return;

    if (useMultipleSuminsured) {
      const packageComparisonUrl = getPackageComparisonlUrl({
        leadId,
        otherParams: savePackages.reduce(
          (acc, pkg) => ({
            insuranceCategory: acc.insuranceCategory.length
              ? `${acc.insuranceCategory},${pkg.insuranceCategory}`
              : `${acc.insuranceCategory}${pkg.insuranceCategory}`,
            sumInsuredMin: acc.sumInsuredMin.length
              ? `${acc.sumInsuredMin},${pkg.sumInsuredMin}`
              : `${acc.sumInsuredMin}${pkg.sumInsuredMin}`,
            sumInsuredMax: acc.sumInsuredMax.length
              ? `${acc.sumInsuredMax},${pkg.sumInsuredMax}`
              : `${acc.sumInsuredMax}${pkg.sumInsuredMax}`,
          }),
          { insuranceCategory: '', sumInsuredMax: '', sumInsuredMin: '' }
        ),
        packageId: packageNames.join(','),
      });
      navigate(packageComparisonUrl);
      return;
    }

    const packageComparisonUrl = getPackageComparisonlUrl({
      leadId,
      otherParams: omit(
        {
          ...filterData,
          'packageFilter.newSearch': true,
          'packageFilter.modelId': filter?.model,
          'packageFilter.brandId': filter?.brand,
          'packageFilter.carYear': filter?.year,
        },
        ['packages']
      ),
      packageId: packageNames.join(','),
    });
    navigate(packageComparisonUrl);
  };

  const handleCopyLink = () => {
    if (!disabledBtns) {
      copyLink({
        lead: `leads/${leadId}`,
        action: 'comparison',
        carInsurancePackageFilter: apiPayload,
      });
    }
  };

  return packageNames.length > 0 ? (
    <div
      className={clsx(
        'fixed bottom-0 bg-white w-screen z-10 flex shadow-stickyFooter',
        comparePackageEnabled
          ? 'justify-between items-center h-[100px]'
          : 'justify-end items-center h-18'
      )}
      data-testid="tool-bar"
    >
      <div className="mr-4 flex">
        {insertInterval(
          Array.from(Array(effectiveMaxLimit).keys()).map((index) => (
            <PackageBrief
              key={index}
              insurancePackage={
                useMultipleSuminsured
                  ? savePackages[index]?.detail
                  : packages[index]
              }
              removePackage={removePackage}
              isComparePackage={comparePackageEnabled}
            />
          )),
          1,
          <Divider
            orientation="vertical"
            pattern="dash"
            className="my-4"
            variant="secondary"
          />
        )}
      </div>
      <div className="flex justify-end pr-[30px]">
        <Button
          text={
            isLoading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              getString('text.download')
            )
          }
          icon={<DownloadFileIcon className="mr-2 text-sm" fillColor="#FFF" />}
          onClick={handleDownloadQuotation}
          className="p-2 m-3 min-h-[30px] px-4 w-[143px] text-[14px]"
          disabled={isLoading || disabledBtns}
          dataTestId="download-tool-bar"
        />

        {isCopyLinkEnabled && (
          <Button
            text={getString('packageListing.copyLink')}
            icon={
              isGeneratingLink ? (
                <CircularProgress
                  color="inherit"
                  size={20}
                  className="w-[20px] h-[20px] mr-1"
                />
              ) : (
                <FileCopyIcon className="mr-2 text-sm text-white" />
              )
            }
            onClick={handleCopyLink}
            className="p-2 m-3 min-h-[30px] px-4 w-[143px] text-[14px]"
            disabled={isGeneratingLink || disabledBtns}
            dataTestId="copy-link-tool-bar"
          />
        )}

        <Button
          text={getString('packageListing.compare')}
          icon={
            <span className="mr-2 px-1 rounded-full bg-success shrink-0 text-white">
              {packageNames.length}
            </span>
          }
          onClick={handleClickCompare}
          className="p-2 m-3 max-h-[30px] px-4 w-[143px] text-[14px]"
          disabled={disabledBtns}
        />
      </div>
      {!comparePackageEnabled && <div className="bg-white w-5 block" />}
    </div>
  ) : null;
}

export default CompareBar;
