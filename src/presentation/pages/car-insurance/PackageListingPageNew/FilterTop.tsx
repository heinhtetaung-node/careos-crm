import React, { useState } from 'react';
import CommonSlider from './PackageFilter/controls/CommonSlider';
import { Typography } from '@material-ui/core';
import CommonCheckBox from './PackageFilter/controls/CommonCheckBox';
import InsurerList from '../../../../mock-data/InsurersList.mock';
import { getString } from 'presentation/theme/localization';
import clsx from 'clsx';

interface FilterTopProps {
  priceRange?: [number, number];
  onPriceRangeChange: (range: [number, number] | undefined) => void;
  insuranceTypes: string[];
  onInsuranceTypesChange: (types: string[]) => void;
  repairTypes: string[];
  onRepairTypesChange: (types: string[]) => void;
  deductibles: string[];
  onDeductiblesChange: (deductibles: string[]) => void;
  selectedInsurers: string[];
  onSelectedInsurersChange: (insurers: string[]) => void;
  initialPriceRange: [number, number];
  maxSelectedInsurers?: number;
}

export type { FilterTopProps };

export default function FilterTop({
  initialPriceRange,
  onPriceRangeChange,
  insuranceTypes,
  onInsuranceTypesChange,
  repairTypes,
  onRepairTypesChange,
  deductibles,
  onDeductiblesChange,
  selectedInsurers,
  onSelectedInsurersChange,
  maxSelectedInsurers = InsurerList.length,
}: Readonly<FilterTopProps>) {
  const insuranceTypeOptions = [
    {
      key: 'type_1',
      label: getString('leadPackageFilter.possibleValue.insuranceType.type1'),
    },
    {
      key: 'type_2+',
      label: getString('leadPackageFilter.possibleValue.insuranceType.type2+'),
    },
    {
      key: 'type_2',
      label: getString('leadPackageFilter.possibleValue.insuranceType.type2'),
    },
    {
      key: 'type_3+',
      label: getString('leadPackageFilter.possibleValue.insuranceType.type3+'),
    },
    {
      key: 'type_3',
      label: getString('leadPackageFilter.possibleValue.insuranceType.type3'),
    },
    {
      key: 'compulsory',
      label: getString(
        'leadPackageFilter.possibleValue.insuranceType.compulsory'
      ),
    },
  ];

  const repairTypeOptions = [
    {
      key: 'garage',
      label: getString('leadPackageFilter.possibleValue.repairType.garage'),
    },
    {
      key: 'dealer',
      label: getString('leadPackageFilter.possibleValue.repairType.dealer'),
    },
  ];

  const deductibleOptions = [
    {
      key: 'no_deductible',
      label: getString(
        'leadPackageFilter.possibleValue.deductible.noDeductible'
      ),
    },
    {
      key: 'only_deductible',
      label: getString(
        'leadPackageFilter.possibleValue.deductible.onlyDeductible'
      ),
    },
  ];

  const [priceRangeLocal, setPriceRangeLocal] = useState(initialPriceRange);

  const toggle = (
    value: string,
    currentArray: string[],
    onChange: (newArray: string[]) => void
  ) => {
    const isCurrentlySelected = currentArray.includes(value);

    if (isCurrentlySelected) {
      // If currently selected, remove it
      const newArray = currentArray.filter((v) => v !== value);
      onChange(newArray);
      return;
    }

    // If not selected, only add if we haven't reached the maximum
    if (currentArray.length < maxSelectedInsurers) {
      const newArray = [...currentArray, value];
      onChange(newArray);
    }
  };

  return (
    <div className="flex bg-[#FAFAFD] p-4">
      <div className="lg:col-span-1 w-[22%]">
        <div className="pr-6">
          <CommonSlider
            title={getString('newPackageListing.carCoverage')}
            tooltipText=""
            minVal={initialPriceRange[0] / 100}
            maxVal={initialPriceRange[1] / 100}
            step={100}
            sliderRange={priceRangeLocal}
            setSliderRange={setPriceRangeLocal}
            onChange={() => onPriceRangeChange(priceRangeLocal)}
          />
        </div>
      </div>

      <div className="w-[26%]">
        <CommonCheckBox
          title={getString('leadPackageFilter.insuranceType')}
          tooltipText=""
          hideSelectAll
          checkboxArr={insuranceTypeOptions}
          checkedArr={insuranceTypes}
          setCheckedArr={onInsuranceTypesChange}
          onChange={() => {}}
          gridCol={3}
        />
      </div>

      <div className="w-[28%]">
        <div className="2xl:pr-8">
          <div className="mt-5" />
          <CommonCheckBox
            title={getString('leadPackageFilter.repairType')}
            tooltipText=""
            hideSelectAll
            checkboxArr={repairTypeOptions}
            checkedArr={repairTypes}
            setCheckedArr={onRepairTypesChange}
            onChange={() => {}}
            titleLeft
            gridCol={3}
          />
          <div className="-mt-2" />
          <CommonCheckBox
            title={getString('leadPackageFilter.deductible')}
            tooltipText=""
            hideSelectAll
            checkboxArr={deductibleOptions}
            checkedArr={deductibles}
            setCheckedArr={onDeductiblesChange}
            onChange={() => {}}
            titleLeft
            gridCol={3}
          />
        </div>
      </div>

      <div className="w-[24%]">
        <div className="flex items-center justify-between mb-[15px] pl-2">
          <Typography className="text-grey-800 font-[700] flex items-center">
            {getString('leadPackageFilter.insurer')}
          </Typography>
        </div>
        <div className="flex flex-wrap gap-1 pl-2">
          {InsurerList.map((item) => {
            const active = selectedInsurers.includes(item.key);
            const isDisabled =
              !active && selectedInsurers.length >= maxSelectedInsurers;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  toggle(item.key, selectedInsurers, onSelectedInsurersChange)
                }
                disabled={isDisabled}
                className={clsx(
                  'p-1 m-0.5 rounded-md flex items-center justify-center transition-all select-none',
                  'bg-transparent border-2',
                  'focus-visible:ring-2 focus-visible:ring-blue-300',
                  '[-webkit-tap-highlight-color:transparent]',
                  {
                    '!ring-blue-500 !ring-2': active,
                    '!border-transparent': !active,
                    '!cursor-pointer': !isDisabled,
                  }
                )}
                aria-pressed={active}
                title={
                  isDisabled
                    ? `${item.label} (Maximum ${maxSelectedInsurers} insurers selected)`
                    : item.label
                }
              >
                <img
                  src={item.logo}
                  alt={item.label}
                  className="w-6 h-6 object-contain pointer-events-none"
                />
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end mb-[15px] pl-2">
          {selectedInsurers.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectedInsurersChange([])}
              className=" text-blue-500 hover:text-blue-700 text-sm font-medium cursor-pointer transition-colors bg-inherit border-none"
              aria-label={getString('text.clearAll')}
            >
              {getString('text.clearAll')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
