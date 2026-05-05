// eslint-disable no-return-assign
import { Button } from '@alphafounders/ui';
import { Collapse } from '@material-ui/core';
import { PRODUCTS } from 'config/TypeFilter';
import { useFormik } from 'formik';
import Select from 'presentation/components/controls/Select';
import { getString } from 'presentation/theme/localization';
import { Color } from 'presentation/theme/variants';
import React, { useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import PackageFilter from './PackageFilter';
import { FilterInterface } from './interface';

import { getAgeByBirthday } from '@careos/utils';
import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import { useLazyGetPackagesQuery } from 'data/slices/packageListing/api';
import { isPackageSelected } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { transformHeaderType } from 'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation/transformations';
import { useGetProductSelector } from 'presentation/redux/selectors/lead';
import { useParams } from 'react-router-dom';
import PackageCard from './PackageCard';
import { getProductCategoryAndPlan, productCategory } from './filterConfig';
import { Package, PackageSource } from 'shared/types/packages';

export default function PackageListingPage() {
  const filter = useFormik<FilterInterface>({
    initialValues: {} as FilterInterface,
    onSubmit: () => console.log('submit'),
  });
  const { id: leadId } = useParams<{ id: string }>();

  const [expandPackage, setExpendedPackage] = useState<string | null>(null);
  const params = useParams<{ id: string }>();
  const { data: lead } = useGetLeadByIDQuery(params.id!);

  const selectedPackage = lead?.data?.checkout?.package ?? '';
  const convertJsonToQueryString = (json: any) =>
    Object.keys(json)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`
      )
      .join('&') as any;
  const [healthPackageFilter, setHealthPackageFilter] = useState<any>({});
  const [healthMulitFilter, setMultipleFilter] = useState<string>('');
  const [selProductCategoryToCard, setSelProductCategoryToCard] =
    useState<string>('');
  const [selProductCategory, setSelProductCategory] = useState<string>('');
  const [selProductSubCategory, setSelProductSubCategory] =
    useState<string>('');

  const product = useGetProductSelector();
  const [getDatas, { data, isLoading, isFetching, isError }] =
    useLazyGetPackagesQuery();

  useEffect(() => {
    if (!Object.keys(healthPackageFilter).length) return;
    getDatas({
      productType: product,
      leadId: leadId!,
      healthPackageFilter: `${
        Object.keys(healthPackageFilter).length > 0
          ? convertJsonToQueryString(healthPackageFilter)
          : ''
      }${healthMulitFilter}`,
    } as any);
  }, [healthPackageFilter, healthMulitFilter]);

  const [packages, setPackages] = useState<any[]>([]);
  const [filteredValues, setFilteredValues] = useState<any>({});
  const [sortBy, setSortBy] = useState<string>('');

  useEffect(() => {
    setPackages([]);
  }, [isError]);

  useEffect(() => {
    setSelProductCategoryToCard(selProductCategory);
  }, [healthPackageFilter]);

  const performFrontendFilter = (
    values: any,
    coverageMinMax: boolean = true
  ) => {
    let packagesFeFilter = data?.packages ?? [];

    if (values?.premium?.max) {
      packagesFeFilter = packagesFeFilter.filter(
        (pkg: any) =>
          pkg?.package?.premium?.units >= values.premium.min * 100 &&
          pkg?.package?.premium?.units <= values.premium.max * 100
      );
    }

    if (coverageMinMax) {
      if (values?.ipdCoverage?.max) {
        packagesFeFilter = packagesFeFilter.filter(
          (pkg: any) =>
            (parseFloat(
              pkg?.package.coverages?.ipdopd_sum_insured_per_time?.limitValue
                ?.units
            ) >=
              parseFloat(values.ipdCoverage.min) * 100 &&
              parseFloat(
                pkg?.package.coverages?.ipdopd_sum_insured_per_time?.limitValue
                  ?.units
              ) <=
                parseFloat(values.ipdCoverage.max) * 100) ||
            (parseFloat(
              pkg?.package.coverages?.ipdopd_sum_insured_per_year?.limitValue
                ?.units
            ) >=
              parseFloat(values.ipdCoverage.min) * 100 &&
              parseFloat(
                pkg?.package.coverages?.ipdopd_sum_insured_per_year?.limitValue
                  ?.units
              ) <=
                parseFloat(values.ipdCoverage.max) * 100)
        );
      }

      if (values?.opdCoverage?.max) {
        packagesFeFilter = packagesFeFilter.filter(
          (pkg: any) =>
            parseFloat(pkg?.package.coverages?.ipdopd_opd?.limitValue?.units) >=
              parseFloat(values.opdCoverage.min) * 100 &&
            parseFloat(pkg?.package.coverages?.ipdopd_opd?.limitValue?.units) <=
              parseFloat(values.opdCoverage.max) * 100
        );
      }
    }

    if (sortBy === 'premiumLowest' && packagesFeFilter.length > 0) {
      packagesFeFilter = [...packagesFeFilter].sort(
        (a: any, b: any) =>
          parseFloat(a.package.premium.units) -
          parseFloat(b.package.premium.units)
      );
    }
    if (sortBy === 'premiumHighest' && packagesFeFilter.length > 0) {
      packagesFeFilter = [...packagesFeFilter].sort(
        (a: any, b: any) =>
          parseFloat(b.package.premium.units) -
          parseFloat(a.package.premium.units)
      );
    }
    if (sortBy === 'maxLowest' && packagesFeFilter.length > 0) {
      packagesFeFilter = [...packagesFeFilter].sort(
        (a: any, b: any) =>
          parseFloat(
            a.package.coverages?.ipdopd_sum_insured_per_year?.limitValue?.units
          ) -
          parseFloat(
            b.package.coverages?.ipdopd_sum_insured_per_year?.limitValue?.units
          )
      );
    }
    if (sortBy === 'maxHighest' && packagesFeFilter.length > 0) {
      packagesFeFilter = [...packagesFeFilter].sort(
        (a: any, b: any) =>
          parseFloat(
            b.package.coverages?.ipdopd_sum_insured_per_year?.limitValue?.units
          ) -
          parseFloat(
            a.package.coverages?.ipdopd_sum_insured_per_year?.limitValue?.units
          )
      );
    }
    if (sortBy === 'hospitalLowest' && packagesFeFilter.length > 0) {
      packagesFeFilter = [...packagesFeFilter].sort(
        (a: any, b: any) =>
          parseFloat(
            a.package.coverages?.ipdopd_non_intensive_care?.limitValue?.units
          ) -
          parseFloat(
            b.package.coverages?.ipdopd_non_intensive_care?.limitValue?.units
          )
      );
    }
    if (sortBy === 'hospitalHighest' && packagesFeFilter.length > 0) {
      packagesFeFilter = [...packagesFeFilter].sort(
        (a: any, b: any) =>
          parseFloat(
            b.package.coverages?.ipdopd_non_intensive_care?.limitValue?.units
          ) -
          parseFloat(
            a.package.coverages?.ipdopd_non_intensive_care?.limitValue?.units
          )
      );
    }

    const reorderPackages = (
      packagesArr: Package[],
      selectedPackageName: string
    ) => {
      const { selected, custom, normal } = packagesArr.reduce<{
        selected: Package[];
        custom: Package[];
        normal: Package[];
      }>(
        (acc, pkg) => {
          const id = pkg?.customPackageResourceName || pkg?.package?.name;

          const isSelectedPkg = isPackageSelected(
            {
              ...pkg?.package,
              id,
            },
            selectedPackageName
          );

          if (isSelectedPkg) {
            acc.selected.push(pkg);
            return acc;
          }

          if (pkg?.customPackageResourceName) {
            acc.custom.push(pkg);
            return acc;
          }

          acc.normal.push(pkg);
          return acc;
        },
        {
          selected: [],
          custom: [],
          normal: [],
        }
      );

      return [...selected, ...custom, ...normal];
    };

    setPackages(reorderPackages(packagesFeFilter, selectedPackage));
  };

  useEffect(() => {
    if (data?.packages) {
      performFrontendFilter(filteredValues, false);
    }
  }, [data, filteredValues]);

  const isRenewalQuote = (
    type: string,
    defaultType: PackageSource
  ): PackageSource =>
    type === 'PLAN_TYPE_RENEWAL' ? 'renewal_manual_quote' : defaultType;

  const renderPackageCard = (x: any) => (
    <Collapse key={x.name}>
      <PackageCard
        selProductCategory={selProductCategoryToCard}
        key={x.package.name}
        insurancePackage={{
          ...x.package,
          originalPrice: x.package?.premium?.units,
          id: x.customPackageResourceName,
          customQuoteDetail: {
            ...x.customQuoteDetails,
            originalPackageName: x.package.name,
          },
          priceSummary: x.priceSummary,
          customPackageResourceName: x.customPackageResourceName,
          customPackageStatus: x.customPackageStatus,
          packageSource: x.customPackageResourceName
            ? 'custom'
            : isRenewalQuote(x.package?.type, 'default'),
          headerType: transformHeaderType(
            x.customPackageResourceName
              ? 'custom'
              : isRenewalQuote(x.package?.type, 'import')
          ),
        }}
        isSelected={isPackageSelected(
          {
            ...x?.package,
            id: x?.customPackageResourceName || x?.package?.name,
          },
          selectedPackage
        )}
        isExpanded={
          expandPackage === (x?.customPackageResourceName || x.package.name)
        }
        filterValues={filter?.values as any}
        isSelectedForComparison={false}
        disabled={false}
        disableAction={false}
        expandPackage={setExpendedPackage}
        onComparePackage={() => {}}
        onRemoveFromComparison={() => {}}
        leadData={lead}
        packageType={PRODUCTS.HEALTH_PRODUCT_INSURANCE}
        setExpendedPackage={setExpendedPackage}
      />
    </Collapse>
  );

  const handleSearch = (values: any) => {
    let uri = '&';
    if (values.insurerArr.length > 0) {
      // eslint-disable-next-line no-return-assign
      values.insurerArr.forEach((element: string) => {
        uri += `healthPackageFilter.insurers=${element}&`;
      });
    }
    if (values.coverageTypeArr.length > 0) {
      // eslint-disable-next-line no-return-assign
      values.coverageTypeArr.forEach((element: string) => {
        uri += `healthPackageFilter.coverage_types=${element}&`;
      });
    }
    if (values.featuresArr.length > 0) {
      // eslint-disable-next-line no-return-assign
      values.featuresArr.forEach((element: string) => {
        uri += `healthPackageFilter.features=${element}&`;
      });
    }

    setMultipleFilter(uri);
    setFilteredValues(values);
    performFrontendFilter(values);
  };

  useEffect(() => {
    const leadInsurance = (lead?.data as any)?.insurance;
    const agePackageFilter: any = {};
    const categoriesFilter: any = {};
    if (lead?.data?.policyHolder?.dob) {
      agePackageFilter['healthPackageFilter.age'] = getAgeByBirthday(
        lead?.data?.policyHolder?.dob || ''
      );
    }
    if (leadInsurance?.category || leadInsurance?.type) {
      if (leadInsurance?.category) {
        setSelProductCategory(leadInsurance?.category);
        categoriesFilter['healthPackageFilter.category'] =
          leadInsurance?.category;
      }
      if (leadInsurance?.subCategory) {
        setSelProductSubCategory(leadInsurance?.subCategory);
        categoriesFilter['healthPackageFilter.sub_category'] =
          leadInsurance?.subCategory;
      }
    }
    setHealthPackageFilter({
      ...healthPackageFilter,
      ...categoriesFilter,
      ...agePackageFilter,
    });
  }, [lead]);

  useEffect(() => {
    performFrontendFilter(filteredValues);
  }, [sortBy]);

  const skeletons = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div data-testid="health-package-listing-page">
      <div className="grid grid-cols-4 gap-1">
        <div className="col-span-1">
          <PackageFilter
            allPackages={packages ?? []}
            filter={filter}
            lead={lead as any}
            hideBackBtn={false}
            onSubmit={(values: any) => handleSearch(values)}
            onChangeSortBy={(val: string) => setSortBy(val)}
            productCategory={selProductCategory}
            healthPackageFilter={healthPackageFilter}
          />
        </div>
        <div className="col-span-3 px-5 pl-2">
          <div className="w-full flex flex-row-reverse">
            <Button
              text="Apply"
              className="px-10 ml-3 h-10 mt-4"
              disabled={!selProductCategory}
              onClick={() => {
                setMultipleFilter('');
                setHealthPackageFilter({
                  'healthPackageFilter.category': selProductCategory,
                  'healthPackageFilter.sub_category': selProductSubCategory,
                  'healthPackageFilter.age': getAgeByBirthday(
                    lead?.data?.policyHolder?.dob || ''
                  ),
                });
              }}
            />
            <div className="w-64">
              <Select
                fixedLabel
                label={getString('healthPackageFilter.productSubCategoryLabel')}
                className="bg-white rounded-2xl"
                selectField="value"
                options={
                  getProductCategoryAndPlan(selProductCategory)?.subCategory
                }
                color={Color.GREY_MEDIUM}
                onChange={(e) =>
                  setSelProductSubCategory(
                    (e.target as HTMLSelectElement).value || ''
                  )
                }
                value={selProductSubCategory}
              />
            </div>
            <div className="w-64 ml-2">
              <Select
                fixedLabel
                label={getString('healthPackageFilter.productCategoryLabel')}
                className="bg-white rounded-2xl"
                selectField="value"
                options={productCategory()}
                color={Color.GREY_MEDIUM}
                onChange={(e) => {
                  setSelProductCategory(
                    (e.target as HTMLSelectElement).value || ''
                  );
                  setSelProductSubCategory('');
                }}
                value={selProductCategory}
              />
            </div>
          </div>
          <div className="flex">
            <div
              className="font-bold my-3 text-[18px]"
              data-testid="listing-package-count"
            >
              {!isLoading && packages?.length ? (
                <span>
                  {packages?.length > 0 && packages?.length}{' '}
                  {getString('leadPackageFilter.packages')}
                </span>
              ) : (
                ''
              )}
            </div>
          </div>
          {!isLoading && !isFetching && data?.packages?.length === 0 && (
            <div className="flex flex-wrap h-100 mx-auto my-0 pt-10">
              <div className="text-center w-full">
                <div className="text-[18px] font-bold">
                  {getString('leadPackageFilter.noPackages')}
                </div>
              </div>
            </div>
          )}

          {isFetching &&
            skeletons.map((i: number) => (
              <div
                key={i}
                className="bg-white flex justify-center items-center h-48 rounded-lg animate-pulse w-full mt-8"
              />
            ))}

          <TransitionGroup>
            {packages.map((pkg: any) => renderPackageCard(pkg))}
          </TransitionGroup>
        </div>
      </div>
    </div>
  );
}
