import { Button, Divider } from '@alphafounders/ui';
import { ArrowLeftIcon } from '@alphafounders/icons';
import { FormikProps } from 'formik';
import _get from 'lodash/get';
import _has from 'lodash/has';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveFilterValuesToStorage } from 'presentation/pages/car-insurance/PackageDetailPage/useGetPackageData';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { Package } from 'shared/types/packages';

import CommonSlider from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/CommonSlider';
import SelectRegion from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/SelectRegion';
import { FilterInterface } from './interface';
import {
  getDefaultValues,
  getFilterConfig,
  getTrueValues,
} from './packageFilter.helper';
import CommonCheckBox from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/CommonCheckBox';
import { HealthLead } from 'shared/types/lead';
import { getProductFeatures } from './filterConfig';

interface PackageFilterProps {
  allPackages: Package[];
  filter: FormikProps<FilterInterface>;
  hideBackBtn?: boolean;
  lead: HealthLead;
  onSubmit: (values: any) => void;
  onChangeSortBy: (val: string) => void;
  productCategory?: string;
  rerenderProps?: any[];
  healthPackageFilter?: { [key: string]: any };
}

function PackageFilter({
  allPackages,
  filter,
  hideBackBtn,
  lead,
  onSubmit,
  onChangeSortBy,
  productCategory,
  healthPackageFilter,
}: Readonly<PackageFilterProps>) {
  const navigate = useNavigate();
  const leadId = getLeadIdFromPath();

  const { config } = useMemo(
    () => getFilterConfig(allPackages),
    [allPackages, productCategory, filter]
  );

  const [lastCategory, setLastCategory] = useState();
  const [configFeatures, setConfigFeatures] = useState<any>([]);

  useEffect(() => {
    if (
      allPackages.length > 0 &&
      healthPackageFilter &&
      healthPackageFilter['healthPackageFilter.category'] !== lastCategory
    ) {
      const features = getProductFeatures(allPackages);

      if (features.length) {
        setConfigFeatures(features);
      }
      setTimeout(() => {
        setLastCategory(healthPackageFilter['healthPackageFilter.category']);
      }, 2000);
    }
  }, [healthPackageFilter, allPackages]);

  const { defaultValues } = useMemo(
    () => getDefaultValues(config, lead),
    [config, lead]
  );

  const [coverageTypeArr, setCoverageTypeArr] = useState<string[]>([]);
  const [insurerArr, setInsurerArr] = useState<string[]>([]);
  const [featuresArr, setFeaturesArr] = useState<string[]>([]);
  const [ipdCoverage, setIpdCoverage] = useState<[number, number]>([
    defaultValues?.ipdCoverage?.min,
    20000000,
  ]);
  const [premium, setPremium] = useState<[number, number]>([
    defaultValues?.ipdCoverage?.min,
    200000,
  ]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    defaultValues?.opdCoverage?.min,
    10000,
  ]);
  const [isUpdated, setUpdated] = useState(false);

  // saving the default filter values when every api call got settled
  useEffect(() => {
    if (defaultValues.coverageType) {
      setCoverageTypeArr(getTrueValues(defaultValues.coverageType));
    }
    if (defaultValues.insurer) {
      setInsurerArr(getTrueValues(defaultValues.insurer));
    }
    // wait for the preliminary api call to finish
    if (defaultValues?.ipdCoverage?.max) {
      filter.setValues(defaultValues);
      setIpdCoverage([
        defaultValues.ipdCoverage.min,
        defaultValues.ipdCoverage.max,
      ]);
      setPriceRange([
        defaultValues.opdCoverage.min,
        defaultValues.opdCoverage.max,
      ]);
    }
    // set the filter value if all things are calculated
    if (
      defaultValues?.opdCoverage?.max &&
      defaultValues?.opdCoverage?.min &&
      defaultValues?.ipdCoverage?.max
    ) {
      saveFilterValuesToStorage(defaultValues as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const goToLeadDetailPage = () => {
    const leadDetailPath = `/health/leads/${leadId.split('/')?.[0]}`;
    navigate(leadDetailPath);
  };

  const handleClear = () => {
    setCoverageTypeArr(getTrueValues(defaultValues.coverageType));
    setInsurerArr(getTrueValues(defaultValues.insurer));
    setIpdCoverage([
      defaultValues.ipdCoverage.min,
      defaultValues.ipdCoverage.max,
    ]);
    setPriceRange([
      defaultValues.opdCoverage.min,
      defaultValues.opdCoverage.max,
    ]);
    setUpdated(false);
  };

  const handleApply = () => {
    const values: FilterInterface = {
      ...filter.values,
      insurer: insurerArr.reduce((p, v) => ({ ...p, [v]: true }), {}),
      features: featuresArr.reduce((p, v) => ({ ...p, [v]: true }), {}),
      opdCoverage: {
        min: priceRange[0],
        max: priceRange[1],
      },
      ipdCoverage: {
        min: ipdCoverage[0],
        max: ipdCoverage[1],
      },
      coverageType: coverageTypeArr.reduce(
        (p, v) => ({ ...p, [v]: true }),
        {}
      ) as any,
      premium: {
        min: premium[0],
        max: premium[1],
      },
    };
    filter.setValues(values);
    onSubmit({
      ...values,
      coverageTypeArr,
      insurerArr,
      featuresArr:
        featuresArr.length === configFeatures.length ? [] : featuresArr,
    });
    saveFilterValuesToStorage(values as any);
    setUpdated(false);
  };

  return (
    <div className="p-5 bg-white">
      {!hideBackBtn && (
        <button
          className="py-5 px-2 flex items-center bg-white border-none"
          type="button"
          onClick={() => goToLeadDetailPage()}
        >
          <ArrowLeftIcon />
          <span className="ml-2">{getString('text.back')}</span>
        </button>
      )}

      <SelectRegion
        value={filter.values.sortBy}
        onChange={(val: string) => {
          filter.setFieldValue('sortBy', val);
          onChangeSortBy(val);
          saveFilterValuesToStorage({
            ...filter.values,
            sortBy: val as any,
          } as any);
        }}
        title={getString(config.sort.title)}
        tooltipHelperText={getString(config.sort.tooltip)}
        options={config.sort.values.map((val) => ({
          key: val.key,
          label: getString(val.label),
        }))}
      />
      <Divider variant="secondary" pattern="dash" />

      <CommonSlider
        title={getString(config.premium.title)}
        tooltipText={getString(config.premium.tooltip)}
        minVal={config.premium.config.min}
        maxVal={200000}
        step={config.premium.config.step}
        sliderRange={premium}
        setSliderRange={setPremium}
        onChange={() => setUpdated(true)}
      />
      <Divider variant="secondary" pattern="dash" />

      <CommonSlider
        title={getString(config.ipdCoverage.title)}
        tooltipText={getString(config.ipdCoverage.tooltip)}
        minVal={config.ipdCoverage.config.min}
        maxVal={config.ipdCoverage.config.max}
        step={config.ipdCoverage.config.step}
        sliderRange={ipdCoverage}
        setSliderRange={setIpdCoverage}
        onChange={() => setUpdated(true)}
      />
      <Divider variant="secondary" pattern="dash" />

      <CommonSlider
        title={getString(config.opdCoverage.title)}
        tooltipText={getString(config.opdCoverage.tooltip)}
        minVal={config.opdCoverage.config.min}
        maxVal={config.opdCoverage.config.max}
        step={config.opdCoverage.config.step}
        sliderRange={priceRange}
        setSliderRange={setPriceRange}
        onChange={() => setUpdated(true)}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Coverages */}
      <CommonCheckBox
        title={getString(config.coverageType.title)}
        tooltipText={getString(config.coverageType.tooltip)}
        checkboxArr={config.coverageType.values}
        checkedArr={coverageTypeArr}
        setCheckedArr={setCoverageTypeArr}
        onChange={() => setUpdated(true)}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Insurers */}
      <CommonCheckBox
        type="insurer"
        title={getString(config.insurer.title)}
        tooltipText={getString(config.insurer.tooltip)}
        checkboxArr={config.insurer.values}
        checkedArr={insurerArr}
        setCheckedArr={setInsurerArr}
        onChange={() => setUpdated(true)}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Features */}
      <CommonCheckBox
        title={getString(config.features.title)}
        tooltipText={getString(config.features.tooltip)}
        checkboxArr={configFeatures}
        checkedArr={featuresArr}
        setCheckedArr={setFeaturesArr}
        onChange={() => setUpdated(true)}
      />
      <Divider variant="secondary" pattern="dash" />

      {isUpdated && (
        <div className="sticky bottom-0 flex justify-center bg-white">
          <Button
            onClick={handleClear}
            text={getString('text.reset')}
            className="p-2 m-3 min-h-[30px] px-4 w-[143px] text-[14px]"
            variant="secondary"
          />
          <Button
            onClick={handleApply}
            text={getString('text.apply')}
            className="p-2 m-3 min-h-[30px] px-4 w-[143px] text-[14px]"
          />
        </div>
      )}
    </div>
  );
}

export default PackageFilter;
