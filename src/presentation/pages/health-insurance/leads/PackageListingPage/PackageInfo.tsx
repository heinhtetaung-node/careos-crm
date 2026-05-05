import { Price } from '@alphafounders/ui';
import _camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
import PackageInfoSection from '../../../car-insurance/PackageListingPageNew/PackageCard/PackageInfoSection';
import { getString } from '../../../../theme/localization';
import { EditOutlineIcon } from '@alphafounders/icons';
import PriceBreakDown from '../../../car-insurance/PackageListingPageNew/PackageCard/PriceBreakdown';
import { TransformedPackageType } from '../../../car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { formatCoverage } from 'presentation/components/QcDetailPage/helpers/utils';
import clsx from 'clsx';
import { satangToBaht } from 'utils/currency';

interface Feature {
  displayName: string;
  code: string;
}

export interface TransformedPackageTypeHealth extends TransformedPackageType {
  priceSummary: any;
  coverages: any;
  premium: string | number;
  hasDiscount: any;
  customQuoteDetail: any;
  name: string;
  id: string;
  displayName: string;
  expiryDate: string;
  disablePackage: boolean;
  isRecommended: boolean;
  carInsuranceType: string;
  insuranceKind: 'mandatory' | 'voluntary' | 'both';
  insurer: string;
  features: Feature[];
  // other properties...
}

interface PackageInfoProps {
  insurancePackage: TransformedPackageTypeHealth;
  onClickPaymentSchedule?: () => void;
  disabled?: boolean;
  selProductCategory: string;
  discountStatus?: string;
}

function PackageInfo({
  insurancePackage,
  onClickPaymentSchedule,
  disabled,
  selProductCategory,
  discountStatus,
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

  const showMaxCoverageLabelByCategory: Record<string, string> = {
    disease: 'healthPackage.ciMaxCoverage',
    ipdOpd: 'healthPackage.ipdMaxCoverage',
    pa: 'healthPackage.paLossOfLife',
    life: 'healthPackage.lifeCoverage',
    home: 'healthPackage.homeCoverage',
  };

  const showMaxCoverageValueByCategory: Record<string, any> = {
    disease: insurancePackage?.coverages?.ci_max_coverage,
    ipdOpd: insurancePackage?.coverages?.ipdopd_sum_insured_per_year,
    pa: insurancePackage?.coverages?.pa_general_accident_ob1,
    life: insurancePackage?.coverages?.ci_max_coverage,
    home: insurancePackage?.coverages?.ci_max_coverage,
  };

  const showCoveragesLabelsByCategory: Record<string, string[]> = {
    disease: [
      'healthPackage.ciMedicExpense',
      'healthPackage.ciPayOnDiagnosis',
      'healthPackage.ciDiseaseCoverage',
    ],
    ipdOpd: [
      'healthPackage.roomCoverage',
      'healthPackage.medicalExpense',
      'healthPackage.surgeryExpense',
      'healthPackage.opdMaxCoverage',
    ],
    pa: [
      'healthPackage.paMedicKid',
      'healthPackage.paIpdKid',
      'healthPackage.paIpdRoomKid',
      'healthPackage.paOpdKid',
    ],
    home: [
      'healthPackage.ciMaxCoverage',
      'healthPackage.ciDiseaseCoverage',
      'healthPackage.ciMonthlyCancerBenefit',
      'healthPackage.ciPayOnDiagnosis',
    ],
    life: ['healthPackage.ciMaxCoverage'],
  };

  const showCoveragesValuesByCategory: Record<string, any> = {
    disease: [
      insurancePackage?.coverages?.ci_medic_expense || // not coming from BE
        insurancePackage?.coverages?.ci_cancer_benf,
      insurancePackage?.coverages?.ci_sum_insured,
      insurancePackage?.coverages?.ci_pay_on_diagnosis,
    ],
    ipdOpd: [
      insurancePackage?.coverages?.ipdopd_non_intensive_care,
      insurancePackage?.coverages?.ipdopd_hospital_expense_time,
      insurancePackage?.coverages?.ipdopd_surgeon_fee,
      insurancePackage?.coverages?.ipdopd_opd,
    ],
    pa: [
      insurancePackage?.coverages?.pa_medic_kid,
      insurancePackage?.coverages?.pa_ipd_kid,
      insurancePackage?.coverages?.pa_ipd_room_kid,
      insurancePackage?.coverages?.pa_opd_kid,
    ],
    home: [
      insurancePackage?.coverages?.ci_max_coverage,
      insurancePackage?.coverages?.ci_disease_coverage,
      insurancePackage?.coverages?.ci_monthly_cancer_benf,
      insurancePackage?.coverages?.ci_pay_on_diagnosis,
    ],
    life: [insurancePackage?.coverages?.ci_max_coverage],
  };

  const showHighlight = (index: number) => [
    index === showCoveragesLabelsByCategory[selProductCategory].length - 1 &&
      'font-bold text-sm text-success my-1 mt-2',
  ];
  const hasDiscount = insurancePackage?.priceSummary?.netDiscountAmount;
  const originalPrice = insurancePackage?.originalPrice;

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-7 flex flex-col">
        <div className="grid grid-cols-12 h-auto">
          <div className="col-span-12 flex flex-wrap mb-2">
            {insurancePackage.features.map((feature) => (
              <span
                key={feature.code}
                className="w-auto p-1 px-2 mr-2 mt-2 rounded-lg bg-slate-100 text-slate-400"
              >
                {feature.displayName}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-12 mt-1 mb-2">
          <div
            className={clsx('flex flex-col', [
              selProductCategory === 'pa' ? 'col-span-8' : 'col-span-5',
            ])}
          >
            <span className="font-bold text-sm text-success h-10">
              {getString(showMaxCoverageLabelByCategory[selProductCategory])}
            </span>
            {showCoveragesLabelsByCategory[selProductCategory].map(
              (coverage: string, i: number) => (
                <span className={clsx('text-sm h-10', showHighlight(i))}>
                  {getString(coverage)}
                </span>
              )
            )}
          </div>
          <div
            className={clsx('flex flex-col', [
              selProductCategory === 'pa' ? 'col-span-4' : 'col-span-7',
            ])}
          >
            <span className="font-bold text-sm text-success h-10 text-wrap">
              {showMaxCoverageValueByCategory[selProductCategory] && (
                <>
                  {formatCoverage(
                    satangToBaht(
                      showMaxCoverageValueByCategory[selProductCategory]
                        ?.limitValue?.units
                    ),
                    0
                  )}{' '}
                  {getString('healthPackage.thb')}/
                  {getString('healthPackage.year')}
                </>
              )}
              {!showMaxCoverageValueByCategory[selProductCategory] && '-'}
            </span>
            {showCoveragesValuesByCategory[selProductCategory].map(
              (coverage: any, i: number) => (
                <span
                  className={clsx('text-sm h-10 text-wrap', showHighlight(i))}
                >
                  {coverage?.limitValue?.units > 0 && (
                    <>
                      {formatCoverage(
                        satangToBaht(coverage?.limitValue?.units),
                        0
                      )}{' '}
                      {getString('healthPackage.thb')}/
                      {getString('healthPackage.time')}
                    </>
                  )}

                  {!(coverage?.limitValue?.units > 0) &&
                    coverage?.summaryEn &&
                    getString('text.yes') === 'Yes' &&
                    coverage.summaryEn}

                  {!(coverage?.limitValue?.units > 0) &&
                    coverage?.summaryEn &&
                    getString('text.yes') !== 'Yes' &&
                    coverage.summaryTh}

                  {!(coverage?.limitValue?.units > 0) &&
                    !coverage?.summaryEn &&
                    '-'}

                  {showCoveragesLabelsByCategory[selProductCategory][i] ===
                    'healthPackage.paMedicKid' && (
                    <>
                      <br />
                      <br />
                    </>
                  )}
                </span>
              )
            )}
          </div>
        </div>
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
                {(insurancePackage?.customQuoteDetail?.numberOfInstallments ??
                  0) > 1
                  ? getString('packageListing.xMonth', {
                      x: insurancePackage.customQuoteDetail
                        ?.numberOfInstallments,
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
              variant={hasDiscount ? 'oldPrice' : 'normal'}
              value={
                hasDiscount
                  ? formatCoverage(satangToBaht(originalPrice))
                  : insurancePackage.premium
              }
            />
            {hasDiscount && (
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
          <PriceBreakDown
            insurancePackage={
              {
                ...insurancePackage,
                customPackageStatus:
                  discountStatus || insurancePackage?.customPackageStatus,
              } as any
            }
          />
        </PackageInfoSection>
      </div>
    </div>
  );
}

export default PackageInfo;
