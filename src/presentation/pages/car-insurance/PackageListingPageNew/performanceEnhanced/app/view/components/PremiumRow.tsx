import React, { memo, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { ChevronLeftOutlined } from '@material-ui/icons';
import type {
  SearchPremiumItem,
  PremiumDetailResponse,
} from '../../model/insurancePackageApi.types';
import { getString } from 'presentation/theme/localization';
import {
  getPremiumAttrs,
  formatPriceUnits,
  normalizeInsuranceTypeLabel,
} from '../../../helper';
import DescriptionSection from './DescriptionSection';

export interface PremiumRowProps {
  premium: SearchPremiumItem;
  insurerId: string;
  isDescriptionExpanded: boolean;
  premiumDetail: PremiumDetailResponse | undefined;
  isDetailError?: boolean;
  onToggleDescription: (premiumName: string) => void;
  onCompare: (premiumName: string) => void;
  onPayment: (premium: SearchPremiumItem, insurerId: string) => void;
  getInsurerName: (insurerId: string) => string;
  onQuotation: (packageId: string) => void;
  columnClasses: readonly string[];
  concatWithBrandModelYear: (subModel: string) => string;
}

const PremiumRow = memo(
  ({
    premium,
    insurerId,
    isDescriptionExpanded,
    premiumDetail,
    isDetailError = false,
    onToggleDescription,
    onCompare,
    onPayment,
    getInsurerName,
    onQuotation,
    columnClasses,
    concatWithBrandModelYear,
  }: Readonly<PremiumRowProps>) => {
    const attrs = useMemo(() => getPremiumAttrs(premium), [premium]);

    const handleToggleDescription = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleDescription(premium.name);
      },
      [onToggleDescription, premium.name]
    );

    const handleCompare = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onCompare(premium.name);
      },
      [onCompare, premium.name]
    );

    const handlePayment = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onPayment(premium, insurerId);
      },
      [onPayment, premium, insurerId]
    );

    const handleQuotation = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onQuotation(premium.name);
      },
      [onQuotation, premium.name]
    );

    const coverageByType = useMemo(() => {
      const coverages = premiumDetail?.product?.coverages ?? [];
      type CoverageItem = (typeof coverages)[number];
      return coverages.reduce<Record<string, CoverageItem>>(
        (acc: Record<string, CoverageItem>, c: CoverageItem) => ({
          ...acc,
          [c.coverageType]: c,
        }),
        {} as Record<string, CoverageItem>
      );
    }, [premiumDetail]);

    const repairTypeCov = coverageByType.repairType;
    const repairTextValue = (
      attrs.repairType ||
      repairTypeCov?.textValue ||
      ''
    ).toLowerCase();

    const repairTypeLabel = useMemo(
      () =>
        (repairTextValue?.includes('garage') &&
          getString('leadPackageFilter.possibleValue.repairType.garage')) ||
        (repairTextValue?.includes('dealer') &&
          getString('leadPackageFilter.possibleValue.repairType.dealer')) ||
        '—',
      [repairTextValue]
    );

    const deductibleDisplay = useMemo(() => {
      if (!attrs.deductible) return '-';
      if (attrs.deductible === 'true') return getString('customTrueFalse.yes');
      if (attrs.deductible === 'false') return getString('customTrueFalse.no');
      return formatPriceUnits(attrs.deductible);
    }, [attrs.deductible]);

    return (
      <>
        <div className="flex gap-4 bg-white border-b border-gray-100 text-xs py-4 px-4">
          <div className={`font-medium ${columnClasses[0]}`}>
            {attrs.display_name}
          </div>
          <div className={columnClasses[1]}>
            {attrs.insuranceType ? (
              <span className="bg-[#E2E8F0] rounded-md px-2 py-1 capitalize">
                {normalizeInsuranceTypeLabel(attrs.insuranceType)}
              </span>
            ) : (
              '—'
            )}
          </div>
          <div className={columnClasses[2]}>
            <span className="capitalize">{repairTypeLabel}</span>
          </div>
          <div className={columnClasses[3]}>
            <span className="capitalize">
              {attrs?.submodel ? concatWithBrandModelYear(attrs.submodel) : '—'}
            </span>
          </div>
          <div className={`${columnClasses[4]} text-center`}>
            {!Number.isNaN(Number.parseFloat(attrs?.maximumannualcoverage))
              ? attrs?.maximumannualcoverage
              : '0'}
          </div>
          <div className={columnClasses[5]}>{deductibleDisplay}</div>
          <div className={columnClasses[6]}>
            {formatPriceUnits(premium.price.units)}
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 text-xs">
          <div className="flex gap-4 items-center py-3 px-4">
            <button
              type="button"
              className="flex items-center gap-1 text-blue-600 hover:underline bg-transparent"
              onClick={handleToggleDescription}
            >
              <ChevronLeftOutlined
                className={clsx(
                  '!text-base transition-transform',
                  isDescriptionExpanded && 'rotate-[-90deg]'
                )}
              />
              {getString('newPackageListing.description')}
            </button>

            <div className="flex gap-4 flex-1 justify-end">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={handleCompare}
              >
                {getString('newPackageListing.addCompare')}
              </button>
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={handlePayment}
              >
                {getString('newPackageListing.payment')}
              </button>
            </div>
          </div>

          <div
            className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"
            aria-hidden="true"
          />

          {isDescriptionExpanded && (
            <DescriptionSection
              premiumDetail={premiumDetail}
              isDetailError={isDetailError}
              coverageByType={coverageByType}
              getInsurerName={getInsurerName}
              onQuotation={handleQuotation}
              normalizeInsuranceTypeLabel={normalizeInsuranceTypeLabel}
              repairTypeLabel={repairTypeLabel}
            />
          )}
        </div>
      </>
    );
  }
);

PremiumRow.displayName = 'PremiumRow';

export default PremiumRow;
