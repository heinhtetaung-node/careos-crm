import React, { useState, useCallback } from 'react';

import { getString } from 'presentation/theme/localization';
import { FormSection } from 'presentation/components/common/FormSection';
import SelectRegion from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/SelectRegion';
import CommonRadio from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/CommonRadio';
import useSnackbar from 'utils/snackbar';
import { useCarFilterLogic } from './useCarFilterLogic';
import ReportProblemModal from 'presentation/pages/car-insurance/PackageListingPageNew/components/ReportProblemModal';
import useManualQuoteRestrictionByInsurerEnabled from 'presentation/hooks/useManualQuoteRestrictionByInsurerEnabled';

const defaultYesNoOptions = [
  { key: 'true', label: getString('carFilter.yes') },
  { key: 'false', label: getString('carFilter.no') },
];

const drivingPurposeOptions = [
  { key: 'personal', label: getString('carFilter.personal') },
  { key: 'commercial', label: getString('carFilter.commercial') },
];

interface CarFilterOption {
  key: string;
  label: string;
}

/** Options with key "0" are placeholders and must not appear in selects. */
function isSelectableCarFilterOption(option: CarFilterOption): boolean {
  return option.key !== '0';
}

interface CarFilterConfigEntry {
  title: string;
  options?: CarFilterOption[];
  tooltip?: string;
}

interface CarFilterConfig {
  year?: CarFilterConfigEntry;
  brand?: CarFilterConfigEntry;
  model?: CarFilterConfigEntry;
  subModel?: CarFilterConfigEntry;
  oic?: CarFilterConfigEntry;
  province?: CarFilterConfigEntry;
  engineSize?: CarFilterConfigEntry;
  noOfDoors?: CarFilterConfigEntry;
  drivingPurpose?: CarFilterConfigEntry;
  dashCam?: CarFilterConfigEntry;
  accessory?: CarFilterConfigEntry;
  modification?: CarFilterConfigEntry;
  [key: string]: CarFilterConfigEntry | undefined;
}

interface CarFilterCurrentData {
  year?: string;
  brand?: string;
  model?: string;
  subModel?: string;
  oic?: string;
  province?: string;
  engineSize?: string;
  noOfDoors?: string;
  drivingPurpose?: string;
  dashCam?: boolean | string;
  accessory?: boolean | string;
  modification?: boolean | string;
  [key: string]: any;
}

interface CarFilterOptionsProps {
  config: CarFilterConfig;
  currentData: CarFilterCurrentData;
  setCurrentData: (key: string, value: any) => void;
  leadData: any;
  setCurrentMultipleData: (obj: { [key: string]: any }) => void;
}

function CarFilterOptions({
  config,
  currentData,
  setCurrentData,
  leadData,
  setCurrentMultipleData,
}: Readonly<CarFilterOptionsProps>) {
  const { handleChange } = useCarFilterLogic({
    leadData,
    setCurrentData,
    carLicensePlate: currentData?.carLicensePlate,
    setCurrentMultipleData,
  });
  const [isReportProblemModalOpen, setIsReportProblemModalOpen] =
    useState(false);

  const isManualQuoteRestrictionByInsurerEnabled =
    useManualQuoteRestrictionByInsurerEnabled();

  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const radioGroups = [
    {
      key: 'drivingPurpose',
      defaultOptions: drivingPurposeOptions,
    },
    {
      key: 'dashCam',
      defaultOptions: defaultYesNoOptions,
    },
    {
      key: 'modification',
      defaultOptions: defaultYesNoOptions,
    },
  ];

  const handleReportProblemClick = useCallback(() => {
    const getLabel = (
      options?: { key: string; label: string }[],
      value?: string
    ) => options?.find((opt) => opt.key === value)?.label ?? '-';

    const lines = [
      `ออเดอร์: ${currentData?.leadId ?? '-'}`,
      `ประกันชั้น: ${currentData?.insuranceType ?? '-'}`,
      `ปี: ${currentData?.year ?? '-'}`,
      `ยี่ห้อ: ${getLabel(config.brand?.options, currentData?.brand)}`,
      `รุ่น: ${getLabel(config.model?.options, currentData?.model)}`,
      `รุ่นย่อย: ${getLabel(
        config.subModel?.options,
        currentData?.carSubModelYear
      )}`,
    ];

    const text = lines.join('\n');

    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSuccessSnackbar(getString('clipboard.success'));

        if (isManualQuoteRestrictionByInsurerEnabled) {
          setIsReportProblemModalOpen(true);
        }
      })
      .catch(() => {
        showErrorSnackbar(getString('clipboard.error'));
      });
  }, [
    currentData,
    config,
    showSuccessSnackbar,
    showErrorSnackbar,
    getString,
    isManualQuoteRestrictionByInsurerEnabled,
  ]);

  const brandOptions = config.brand?.options ?? [];
  const modelSelectOptions = config.model?.options ?? [];

  const selectedBrand =
    currentData?.brand !== undefined &&
    currentData?.brand !== null &&
    currentData?.brand !== '' &&
    brandOptions.some(
      (option) => option.key !== '' && option.key === currentData.brand
    );

  const selectedModel =
    currentData?.model !== undefined &&
    currentData?.model !== null &&
    currentData?.model !== '' &&
    modelSelectOptions.some(
      (option) => option.key !== '' && option.key === currentData.model
    );

  const modelOptions = selectedBrand
    ? modelSelectOptions.filter(isSelectableCarFilterOption)
    : [];

  const subModelOptions = selectedModel ? (config.subModel?.options ?? []) : [];
  return (
    <div>
      <ReportProblemModal
        isOpen={isReportProblemModalOpen}
        onClose={() => setIsReportProblemModalOpen(false)}
        leadId={leadData?.name?.split('/')?.[1] ?? ''}
      />
      <h1 className="text-primary text-lg underline mb-4">
        {getString('text.car')}
      </h1>

      {/* Car Details Section */}
      <FormSection>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {['year', 'brand', 'model'].map((key) => {
              const options =
                key === 'model'
                  ? modelOptions
                  : (config[key]?.options?.filter(
                      isSelectableCarFilterOption
                    ) ?? []);
              return (
                <div
                  key={key}
                  className={`${key === 'model' ? 'col-span-2' : ''}`}
                >
                  <SelectRegion
                    title={getString(
                      config[key]?.title ||
                        `${key.charAt(0).toUpperCase() + key.slice(1)}*`
                    )}
                    value={currentData?.[key] ?? ''}
                    onChange={(e) => handleChange(key, e)}
                    disabled={options.length === 0}
                    options={options}
                    tooltipHelperText={getString(config[key]?.tooltip ?? '')}
                  />
                </div>
              );
            })}
          </div>

          {/* Sub Model */}
          <div className="bg-[#F5FBF8] p-2 flex flex-col">
            <SelectRegion
              title={getString('carFilter.subModel')}
              value={currentData?.carSubModelYear ?? ''}
              onChange={(e) => handleChange('carSubModelYear', e)}
              options={subModelOptions?.filter(isSelectableCarFilterOption)}
              disabled={subModelOptions?.length === 0}
              tooltipHelperText={getString(config.subModel?.tooltip ?? '')}
            />
            <button
              type="button"
              className="mt-2 mb-2 cursor-pointer font-bold self-end uppercase border-none w-[138px] h-[24px] bg-primary text-white text-[10px] rounded-[8px] flex items-center justify-center hover:bg-primary-dark"
              onClick={handleReportProblemClick}
            >
              {getString('carFilter.reportProblem')}
            </button>
          </div>
        </div>
      </FormSection>

      {/* Regulatory/Location Section */}
      <FormSection>
        <div className="space-y-3">
          {/* Province */}
          <div>
            <SelectRegion
              title={getString(config.province?.title || 'carFilter.province')}
              value={currentData?.province ?? ''}
              onChange={(e) => handleChange('province', e)}
              options={config.province?.options ?? []}
              tooltipHelperText={getString(config.province?.tooltip ?? '')}
            />
          </div>
        </div>
      </FormSection>

      {/* Usage and Modification Section */}
      <FormSection>
        <div className="space-y-4">
          {radioGroups.map(({ key, defaultOptions }) => {
            const conf = config[key] as any;
            if (!conf || key === 'modification') return null; // Skip if config entry is missing
            return (
              <div key={key}>
                <CommonRadio
                  title={getString(conf.title || `carFilter.${key}`)}
                  tooltipText={getString(conf.tooltip ?? '')}
                  selectedValue={currentData[key]?.toString() ?? ''}
                  options={conf.options ?? defaultOptions}
                  setValue={(e: any) => handleChange(key, e)}
                  onChange={() => ''}
                />
              </div>
            );
          })}
        </div>
      </FormSection>
    </div>
  );
}

export default CarFilterOptions;
