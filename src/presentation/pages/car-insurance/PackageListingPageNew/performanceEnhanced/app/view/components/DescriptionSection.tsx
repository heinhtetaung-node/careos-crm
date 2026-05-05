import React, { useMemo } from 'react';
import type { PremiumDetailResponse } from '../../model/insurancePackageApi.types';
import { getLanguage, getString } from 'presentation/theme/localization';
import { formatPriceUnits } from '../../../helper';
import { formatDate } from 'shared/helper/utilities';
import { camelCase } from 'lodash';

export interface DescriptionSectionProps {
  premiumDetail: PremiumDetailResponse | undefined;
  isDetailError: boolean;
  coverageByType: Record<string, Coverage>;
  getInsurerName: (insurerId: string) => string;
  onQuotation: (e: React.MouseEvent) => void;
  normalizeInsuranceTypeLabel: (value?: string) => string;
  repairTypeLabel: string;
}

export type Coverage = {
  coverageType: string;
  textValue?: string;
  singleValue?: unknown;
  name: string;
  coverageName: string;
};

const availLanCoveragesMap = new Set([
  'ownedCarDamage',
  'maximumAnnualCoverage',
  'fireAndTheft',
  'flood',
  'vehicleOicCode',
  'insuranceType',
  'drivingPurpose',
  'repairType',
  'dashCam',
  'thirdPartyDeathPerPerson',
  'thirdPartyPropertyDamage',
  'personalInjuryPerPerson',
  'medicalExpensePerPerson',
  'bailBondPerTime',
  'modification',
  'voluntaryPremium',
  'mandatoryPremium',
  'personalAccidentCoverageNumber',
  'thirdPartyMaxDeath',
  'termAndCondition',
]);

const coverageTranslationAliases: Record<string, string> = {
  personalInjury: 'personalInjuryPerPerson',
  personalMedicalExpense: 'medicalExpensePerPerson',
  personalBailBond: 'bailBondPerTime',
  ownedCarFlood: 'flood',
  ownedCarFireTheft: 'fireAndTheft',
};

const excludeFields = new Set([
  'insuranceType',
  'dashCam',
  'repairType',
  'oicCode',
  'deductible',
  'mandatoryPrice',
  'voluntaryPrice',
  'termAndConditionEN',
  'termAndConditionTH',
  'mandatoryPackageId',
  'modification',
  'vehicleRegistrationPurpose',
  'personalAccidentCoverageNumber',
]);

const mandatoryFields = [
  ['ownedCarDamage', 'maximumAnnualCoverage'],
  ['personalInjury', 'personalInjuryPerPerson'],
  ['personalMedicalExpense', 'medicalExpensePerPerson'],
  ['personalBailBond', 'bailBondPerTime'],
  ['thirdPartyPropertyDamage'],
  ['thirdPartyDeathPerPerson'],
  ['thirdPartyMaxDeath'],
  ['ownedCarFlood', 'flood'],
  ['ownedCarFireTheft', 'fireAndTheft'],
];

const normalizeCoverageType = (coverageType: string) =>
  coverageType.split('.').pop() ?? coverageType;

const getCoverageDisplayName = (coverage: Coverage) => {
  const normalizedCoverageType = normalizeCoverageType(coverage.coverageType);
  const translatedCoverageType =
    coverageTranslationAliases[normalizedCoverageType] ??
    normalizedCoverageType;

  if (availLanCoveragesMap.has(translatedCoverageType)) {
    return getString(`newPackageListing.coverages.${translatedCoverageType}`);
  }

  const normalizedCoverageName = camelCase(coverage.coverageName.toLowerCase());
  if (availLanCoveragesMap.has(normalizedCoverageName)) {
    return getString(`newPackageListing.coverages.${normalizedCoverageName}`);
  }

  return coverage.coverageName;
};

const getCoveragePrice = (cov: Coverage): string => {
  if (cov?.singleValue) {
    return formatPriceUnits((cov.singleValue as { units: string }).units);
  }
  return '-';
};

export default function DescriptionSection({
  premiumDetail,
  isDetailError,
  coverageByType,
  getInsurerName,
  onQuotation,
  normalizeInsuranceTypeLabel,
  repairTypeLabel,
}: Readonly<DescriptionSectionProps>) {
  const currentLocale = getLanguage();
  const termsAndConditions = useMemo(() => {
    if (currentLocale === 'th') {
      return (
        coverageByType?.termsAndConditionsTH?.textValue ??
        coverageByType?.termAndConditionTH?.textValue
      );
    }
    return (
      coverageByType?.termsAndConditionsEN?.textValue ??
      coverageByType?.termAndConditionEN?.textValue
    );
  }, [
    currentLocale,
    coverageByType.termsAndConditionsTH,
    coverageByType.termsAndConditionsEN,
    coverageByType.termAndConditionTH,
    coverageByType.termAndConditionEN,
  ]);

  if (isDetailError) {
    return (
      <div className="py-2 px-4 pl-12 text-red-500">
        {getString('text.errorFetchingData')}
      </div>
    );
  }

  const detailProduct = premiumDetail?.product;
  if (!detailProduct) {
    return (
      <div className="py-2 px-4 pl-12 text-gray-500">
        {getString('text.loading')}
      </div>
    );
  }

  const { package: pkg, coverages } = detailProduct;
  const mandatoryCov = coverageByType.mandatoryPrice;
  const voluntaryCov = coverageByType.voluntaryPrice;
  const dashCamCov = coverageByType.dashCam;
  const oicCodeCov = coverageByType.oicCode;
  const insuranceTypeCov = coverageByType.insuranceType;
  const deductibleCov = coverageByType.deductible;

  const deductiblePrice = getCoveragePrice(deductibleCov);
  const mandatoryPrice = getCoveragePrice(mandatoryCov);
  const voluntaryPrice = getCoveragePrice(voluntaryCov);

  return (
    <div className="py-4 px-4 bg-[#F2F3FA66] flex flex-col gap-2">
      <div className="flex flex-col gap-4 text-xs">
        <div className="grid grid-cols-5 gap-5">
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.uploadPackageName')}:{' '}
            </span>
            <span>{pkg.packageName}</span>
          </div>
          <div className="flex flex-col gap-1" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.repairType')}:
            </span>
            <span>{repairTypeLabel}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.includeDashCamDiscount')}:
            </span>
            <span>
              {dashCamCov?.textValue === 'Required'
                ? getString('customTrueFalse.true')
                : getString('customTrueFalse.false')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">{getString('text.expiryDate')}:</span>
            <span>{pkg.validTo ? formatDate(new Date(pkg.validTo)) : '—'}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.insuranceCompany')}:
            </span>
            <span>{getInsurerName(pkg.insurer)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.oicCode')}:
            </span>
            <span>{oicCodeCov?.textValue || '—'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.insuranceType')}:
            </span>
            <span>
              {normalizeInsuranceTypeLabel(insuranceTypeCov?.textValue) || '—'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.deductible')}:
            </span>
            <span>{deductiblePrice ?? '-'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">{getString('text.startDate')}:</span>
            <span>
              {pkg.validFrom ? formatDate(new Date(pkg.validFrom)) : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.mandatoryPrice')}:
            </span>
            <span>{mandatoryPrice}</span>
          </div>
          <div className="col-span-4 flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.premium')}:
            </span>
            <span>{voluntaryPrice}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-2">
            <div className="flex flex-col gap-1">
              <span className="font-bold">
                {getString('newPackageListing.coverageDetails')}
              </span>
              <div className="!-mr-[10px]">
                {mandatoryFields.map((coverageTypes) => {
                  const c = coverages.find((cov) =>
                    coverageTypes.includes(
                      normalizeCoverageType(cov.coverageType)
                    )
                  );
                  if (!c || excludeFields.has(c.coverageType)) {
                    return null;
                  }
                  return (
                    <div key={c.name} className="grid grid-cols-2 gap-2">
                      <span className="font-bold">
                        {getCoverageDisplayName(c)}:
                      </span>
                      <span className="text-left text-nowrap">
                        {c?.singleValue
                          ? formatPriceUnits(
                              (c.singleValue as { units: string }).units
                            )
                          : c.textValue || '0'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <span className="font-bold">
              {getString('text.termsAndConditions')}:
            </span>
            {termsAndConditions
              ?.split('\n')
              .filter((line) => line.trim().length > 0)
              .map((line, index) => {
                const firstWord = line.trim().split(/\s+/)[0] || 'line';

                return <span key={`${firstWord}-${index}`}>{line}</span>;
              })}
          </div>
          <div className="col-span-1 flex flex-col gap-1">
            <span className="font-bold">
              {getString('newPackageListing.applicableProvinces')}:
            </span>
            {pkg?.applicableProvince
              ? pkg.applicableProvince
                  .split(',')
                  .map((province) => province.trim())
                  .join(', ')
              : '—'}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <button
          type="button"
          className="bg-transparent border-none text-blue-600 underline cursor-pointer text-xs hover:text-opacity-50"
          onClick={onQuotation}
        >
          {getString('newPackageListing.quotation')}
        </button>
      </div>
    </div>
  );
}
