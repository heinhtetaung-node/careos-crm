import { Button, Divider } from '@alphafounders/ui';
import { ArrowLeftIcon } from '@alphafounders/icons';
import { CircularProgress } from '@material-ui/core';
import { skipToken } from '@reduxjs/toolkit/query';
import { FormikProps } from 'formik';
import _get from 'lodash/get';
import _has from 'lodash/has';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import {
  useGetSumInsuredRangeQuery,
  useInsurerSumInsuredRangeQuery,
} from 'data/slices/packageListing/api';
import { saveFilterValuesToStorage } from 'presentation/pages/car-insurance/PackageDetailPage/useGetPackageData';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { Lead } from 'shared/types/lead';
import { Package } from 'shared/types/packages';

import CommonCheckBox from './controls/CommonCheckBox';
import CommonSlider from './controls/CommonSlider';
import SelectRegion from './controls/SelectRegion';
import { FilterInterface } from './interface';
import {
  decodeDeductible,
  decodeInsuranceType,
  decodeRepairType,
  encodeDeductible,
  encodeInsuranceType,
  encodeRepairType,
  getDefaultValues,
  getFilterConfig,
  getTrueValues,
  injectSumInsuredRangeToInsurer,
} from './packageFilter.helper';

interface PackageFilterProps {
  allPackages: Package[];
  filter: FormikProps<FilterInterface>;
  hideBackBtn?: boolean;
  newPackageListing?: boolean;
  isUpdated?: boolean;
  setUpdated?: (param: boolean) => void;
}

function PackageFilter({
  allPackages,
  filter,
  newPackageListing,
  setUpdated,
  hideBackBtn = false,
  isUpdated = false,
}: Readonly<PackageFilterProps>) {
  const navigate = useNavigate();
  const leadId = getLeadIdFromPath();
  const dispatch = useDispatch();
  const [isUpdatedOld, setUpdatedOld] = useState(false);

  const { data: lead, isLoading: leadLoading } = useGetLeadByIDQuery(leadId);

  const {
    data: sumInsuredMinMax,
    isError,
    isLoading: sumInsuredLoading,
    error,
  } = useGetSumInsuredRangeQuery(lead?.data?.carSubModelYear ?? skipToken, {
    skip: !lead?.data?.carSubModelYear,
  });

  const { data: insurerSumInsuredRange } = useInsurerSumInsuredRangeQuery(
    lead?.data?.carSubModelYear ?? skipToken,
    { skip: !lead?.data?.carSubModelYear }
  );

  if (
    !sumInsuredLoading &&
    isError &&
    error &&
    _has(error, 'status') &&
    _get(error, 'status') === 404
  ) {
    dispatch(
      showSnackBar({
        isOpen: true,
        message: getString('errors.sumInsured'),
        status: CONSTANTS.snackBarConfig.type.error,
      })
    );
  }

  const { config } = useMemo(
    () =>
      getFilterConfig(allPackages, {
        sumInsuredMinMax,
      }),
    [allPackages, sumInsuredMinMax]
  );

  const { defaultValues } = useMemo(
    () =>
      getDefaultValues(config, lead as Lead, {
        sumInsuredMinMax,
      }),
    [config, lead, sumInsuredMinMax]
  );

  const [insuranceTypeArr, setInsuranceTypeArr] = useState<string[]>(
    decodeInsuranceType(
      defaultValues.insuranceType,
      defaultValues.insuranceCategory
    )
  );
  const [insurerArr, setInsurerArr] = useState<string[]>(
    getTrueValues(defaultValues.insurer)
  );
  const [repairTypeArr, setRepairTypeArr] = useState<string[]>(
    decodeRepairType(defaultValues.repairType)
  );
  const [deductibleArr, setDeductibleArr] = useState<string[]>(
    decodeDeductible(defaultValues.deductible)
  );
  const [sumInsuredRange, setSumInsuredRange] = useState<[number, number]>([
    defaultValues?.sumInsured?.min,
    defaultValues?.sumInsured?.max,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    defaultValues?.price?.min,
    defaultValues?.price?.max,
  ]);

  // saving the default filter values when every api call got settled
  useEffect(() => {
    // wait for the preliminary api call to finish
    if (defaultValues?.sumInsured?.max) {
      filter.setValues(defaultValues);
      setSumInsuredRange([
        defaultValues.sumInsured.min,
        defaultValues.sumInsured.max,
      ]);
      setPriceRange([defaultValues.price.min, defaultValues.price.max]);
    }
    // set the filter value if all things are calculated
    if (
      defaultValues?.price?.max &&
      defaultValues?.price?.min &&
      defaultValues?.sumInsured?.max &&
      !newPackageListing
    ) {
      saveFilterValuesToStorage(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const goToLeadDetailPage = () => {
    const leadDetailPath = `/leads/${leadId}`;
    navigate(leadDetailPath);
  };

  const handleClear = () => {
    setInsuranceTypeArr(
      decodeInsuranceType(
        defaultValues.insuranceType,
        defaultValues.insuranceCategory
      )
    );
    setInsurerArr(getTrueValues(defaultValues.insurer));
    setRepairTypeArr(decodeRepairType(defaultValues.repairType));
    setDeductibleArr(decodeDeductible(defaultValues.deductible));
    setSumInsuredRange([
      defaultValues.sumInsured.min,
      defaultValues.sumInsured.max,
    ]);
    setPriceRange([defaultValues.price.min, defaultValues.price.max]);
    isUpdated ? setUpdated?.(false) : setUpdatedOld(false);
  };

  const handleApply = () => {
    const [category, types] = encodeInsuranceType(insuranceTypeArr);
    const values: FilterInterface = {
      ...filter.values,
      insuranceCategory: category,
      insurer: insurerArr.reduce((p, v) => ({ ...p, [v]: true }), {}),
      repairType: encodeRepairType(repairTypeArr),
      deductible: encodeDeductible(deductibleArr),
      price: {
        min: priceRange[0],
        max: priceRange[1],
      },
      sumInsured: {
        min: sumInsuredRange[0],
        max: sumInsuredRange[1],
      },
      insuranceType: types,
      isDefaultSumInsured:
        config.sumInsured.config.max === sumInsuredRange[1] &&
        config.sumInsured.config.min === sumInsuredRange[0] &&
        defaultValues.isDefaultSumInsured,
    };
    filter.setValues(values);
    if (!newPackageListing) saveFilterValuesToStorage(values);
    isUpdated ? setUpdated?.(false) : setUpdatedOld(false);
  };

  if (leadLoading || sumInsuredLoading) {
    return (
      <div className="p-5 flex bg-white items-center justify-center h-[80vh]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-3 bg-white">
      {newPackageListing && (
        <h1 className="text-primary text-lg underline">
          {getString('menu.package.root')}
        </h1>
      )}
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

      {!newPackageListing && (
        <SelectRegion
          value={filter.values.sortBy}
          onChange={(val: string) => {
            filter.setFieldValue('sortBy', val);
            saveFilterValuesToStorage({ ...filter.values, sortBy: val as any });
          }}
          title={getString(config.sort.title)}
          tooltipHelperText={getString(config.sort.tooltip)}
          options={config.sort.values.map((val) => ({
            key: val.key,
            label: getString(val.label),
          }))}
        />
      )}
      <Divider variant="secondary" pattern="dash" />

      {/* Insurance Type Region */}
      <CommonCheckBox
        title={getString(config.insuranceType.title)}
        tooltipText={getString(config.insuranceType.tooltip)}
        checkboxArr={config.insuranceType.values}
        checkedArr={insuranceTypeArr}
        setCheckedArr={setInsuranceTypeArr}
        onChange={() => (isUpdated ? setUpdated?.(true) : setUpdatedOld(true))}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Insurer Region */}
      <CommonCheckBox
        type="insurer"
        title={getString(config.insurer.title)}
        tooltipText={getString(config.insurer.tooltip)}
        checkboxArr={injectSumInsuredRangeToInsurer(
          config.insurer.values,
          insurerSumInsuredRange?.range ?? []
        )}
        checkedArr={insurerArr}
        setCheckedArr={setInsurerArr}
        onChange={() => (isUpdated ? setUpdated?.(true) : setUpdatedOld(true))}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Repair Type Region */}
      <CommonCheckBox
        title={getString(config.repairType.title)}
        tooltipText={getString(config.repairType.tooltip)}
        checkboxArr={config.repairType.values}
        checkedArr={repairTypeArr}
        setCheckedArr={setRepairTypeArr}
        onChange={() => (isUpdated ? setUpdated?.(true) : setUpdatedOld(true))}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Sum Insured Region */}
      <CommonSlider
        title={getString(config.sumInsured.title)}
        tooltipText={getString(config.sumInsured.tooltip)}
        minVal={config.sumInsured.config.min}
        maxVal={config.sumInsured.config.max}
        step={config.sumInsured.config.step}
        sliderRange={sumInsuredRange}
        setSliderRange={setSumInsuredRange}
        onChange={() => (isUpdated ? setUpdated?.(true) : setUpdatedOld(true))}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Price Range Region */}
      <CommonSlider
        title={getString(config.price.title)}
        tooltipText={getString(config.price.tooltip)}
        minVal={config.price.config.min}
        maxVal={config.price.config.max}
        step={config.price.config.step}
        sliderRange={priceRange}
        setSliderRange={setPriceRange}
        onChange={() => (isUpdated ? setUpdated?.(true) : setUpdatedOld(true))}
      />
      <Divider variant="secondary" pattern="dash" />

      {/* Deductible Region */}
      <CommonCheckBox
        title={getString(config.deductible.title)}
        tooltipText={getString(config.deductible.tooltip)}
        checkboxArr={config.deductible.values}
        checkedArr={deductibleArr}
        setCheckedArr={setDeductibleArr}
        onChange={() => (isUpdated ? setUpdated?.(true) : setUpdatedOld(true))}
      />
      <Divider variant="secondary" pattern="dash" />
      {(isUpdated || isUpdatedOld) && (
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
