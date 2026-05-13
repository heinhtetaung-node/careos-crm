import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeftOutlined } from '@material-ui/icons';

import { getString } from 'presentation/theme/localization';
import { FormSection } from 'presentation/components/common/FormSection';
import SelectRegion from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/SelectRegion';
import CommonRadio from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/CommonRadio';
import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import Input from 'presentation/components/controls/Input';
import LicensePlate from 'presentation/components/CarInfoSection/EditableCarSection/LicensePlate';
import { provinceAbbreviationCollection } from 'shared/constants/provinceAbbreviation';
import Autocomplete from 'presentation/components/controls/Autocomplete/Autocomplete';
import { vehicleColorOptions } from 'presentation/components/VehiclePolicySection/helper';
import { getListInsurer } from 'presentation/redux/actions/leadDetail/insurer';
import {
  IInsurerItem,
  LIST_INSURERS_PAGE_SIZE,
  sortPreferedInsurers,
} from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getInsuranceKindOptions } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { getAgeByDOB } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import { getPurchasingPurposeOptions } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import { leadTitleOptions } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import FixedDriverModal from 'presentation/components/modal/FixedDriverModal';
import { OpenIcon } from 'presentation/components/icons';
import { isValidNameInput, isValidNationalId } from 'utils/customerInfo';
import {
  defaultYesNoOptions,
  genderOptions,
  languageOptions,
  ALLOWED_FIXED_DRIVER_COUNTS,
  getFieldTitle,
  getFieldTooltip,
  getFieldOptions,
  getFieldMeta,
  handleUpdateLead as handleUpdateLeadHelper,
  handlePolicyHolderTypeChange as handlePolicyHolderTypeChangeHelper,
  runValidation,
} from './LeadFilterOptions.helper';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import MutationResponseDialog from 'presentation/components/common/StatusDialog';
import { SuccessIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import useSnackbar from 'utils/snackbar';

interface LeadFilterOptionsProps {
  config: any;
  currentData: any;
  setCurrentData: (key: string, value: any) => void;
  leadData: any;
  setCurrentMultipleData: (obj: { [key: string]: any }) => void;
}

interface FieldConfig {
  disabled?: boolean;
  key: string;
  fallbackKey: string;
  type: string;
  fallbackOptions?: any[];
  name?: string;
  isMultiSelect?: boolean;
  asterisk?: boolean;
}

function FilterSelectRegion({
  config,
  currentData,
  handleChange,
  fieldKey,
  fallbackKey,
  fallbackOptions = [],
  asterisk,
  policyHolderTypeUpdating,
}: Readonly<{
  config: any;
  currentData: any;
  handleChange: (key: string, value: any) => void;
  fieldKey: string;
  fallbackKey: string;
  fallbackOptions?: any[];
  asterisk?: boolean;
  policyHolderTypeUpdating: boolean;
}>) {
  return (
    <div className="mt-1">
      <SelectRegion
        data-testid={`select-region-${fieldKey}`}
        title={`${getFieldTitle(config, fieldKey, fallbackKey)}${
          asterisk ? ' *' : ''
        }`}
        value={currentData?.[fieldKey] ?? ''}
        onChange={(e) => handleChange(fieldKey, e)}
        options={getFieldOptions(config, fieldKey, fallbackOptions)}
        tooltipHelperText={getFieldTooltip(fieldKey)}
        disabled={policyHolderTypeUpdating}
        backgroundColor="#FFF"
      />
    </div>
  );
}

function FilterInput({
  config,
  currentData,
  handleChange,
  fieldKey,
  fallbackKey,
  name,
  disabled,
  handleUpdateLead,
}: Readonly<{
  config: any;
  currentData: any;
  handleChange: (key: string, value: any) => void;
  fieldKey: string;
  fallbackKey: string;
  name: string;
  disabled: boolean;
  handleUpdateLead: (key: string, value: any) => void;
}>) {
  const [validationError, setValidationError] = useState<string>('');

  const getValidationFn = (key: string) => {
    if (key.includes('FirstName') || key.includes('LastName'))
      return isValidNameInput;
    if (key.includes('policyHolderNationalId')) return isValidNationalId;
    return null;
  };
  const validateField = (value: string) => {
    const validationFn = getValidationFn(fieldKey);
    return validationFn ? validationFn(value) : '';
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleChange(fieldKey, value);
    const error = validateField(value);
    setValidationError(error);
  };

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const error = validateField(value);
    setValidationError(error);
    if (!error) handleUpdateLead(fieldKey, value);
  };

  return (
    <>
      <label htmlFor={name} className="font-bold mb-4">
        {getFieldTitle(config, fieldKey, fallbackKey)}{' '}
        {!fieldKey.toLowerCase().includes('age') && '*'}
      </label>
      <Input
        data-testid={`input-${fieldKey}`}
        disabled={disabled}
        id={name}
        className="mt-4"
        name={name}
        value={
          fieldKey.toLowerCase().includes('age') &&
          Number.isNaN(currentData?.[fieldKey])
            ? ''
            : currentData?.[fieldKey]
        }
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        backgroundColor="#FFF"
      />
      {validationError && (
        <div
          className="text-red-500 text-sm mt-1"
          data-testid={`error-${fieldKey}`}
        >
          {validationError}
        </div>
      )}
    </>
  );
}

function FilterDatePicker({
  config,
  currentData,
  handleChange,
  fieldKey,
  fallbackKey,
  disabled,
  warning,
}: Readonly<{
  config: any;
  currentData: any;
  handleChange: (key: string, value: any) => void;
  fieldKey: string;
  fallbackKey: string;
  disabled: boolean;
  warning?: string;
}>) {
  return (
    <div>
      <div className="mb-3.5 font-bold">
        {getFieldTitle(config, fieldKey, fallbackKey)}
      </div>
      <div className="bg-white p-1.5 rounded-[10px] border border-solid border-[#e9edf5]">
        <DatePickerWithThaiYear
          data-testid={`date-picker-${fieldKey}`}
          value={currentData?.[fieldKey] ?? ''}
          onChangeDate={(e: any) => handleChange(fieldKey, e)}
          placeholder={getString('leadFilter.selectDate')}
          isDisabled={disabled}
        />
      </div>
      {warning && <div className="text-red-500 text-sm mt-1">{warning}</div>}
    </div>
  );
}

function FilterRadio({
  config,
  currentData,
  handleChange,
  fieldKey,
  fallbackKey,
  fallbackOptions,
}: Readonly<{
  config: any;
  currentData: any;
  handleChange: (key: string, value: any) => void;
  fieldKey: string;
  fallbackKey: string;
  fallbackOptions: any[];
}>) {
  return (
    <CommonRadio
      title={getFieldTitle(config, fieldKey, fallbackKey)}
      tooltipText={getFieldTooltip(fieldKey)}
      selectedValue={currentData[fieldKey]?.toString() ?? ''}
      options={getFieldOptions(config, fieldKey, fallbackOptions)}
      setValue={(e: any) => handleChange(fieldKey, e)}
      onChange={() => ''}
    />
  );
}

function FilterLicensePlate({
  config,
  currentData,
  handleChange,
  fieldKey,
  fallbackKey,
  abbreviation,
  handleUpdateLead,
  disabled,
}: Readonly<{
  config: any;
  currentData: any;
  handleChange: (key: string, value: any) => void;
  fieldKey: string;
  fallbackKey: string;
  abbreviation: string;
  handleUpdateLead: (key: string, value: any) => void;
  disabled: boolean;
}>) {
  return (
    <>
      <div className="mb-5 font-bold">
        {getFieldTitle(config, fieldKey, fallbackKey)}
      </div>
      <div className="!-ml-2 2xl:!-ml-0.5 !text-xs">
        <LicensePlate
          name={fieldKey}
          title={getFieldTitle(config, fieldKey, fallbackKey)}
          value={{ carLicensePlate: currentData?.[fieldKey] ?? '' }}
          handleUpdate={(update: any) => {
            const newValue = update[fieldKey];
            if (
              newValue !== undefined &&
              newValue?.split('-')?.[1]?.charAt(0) !== ' '
            ) {
              handleChange(fieldKey, newValue);
              handleUpdateLead(fieldKey, newValue);
            }
          }}
          abbreviation={abbreviation}
          dataTestId={`${fieldKey}-license-plate`}
          isReadOnly={disabled}
          isDisabled={disabled}
          hideLabel
          backgroundColor={!disabled ? 'white' : undefined}
        />
        {currentData?.redPlate === 'false' &&
          currentData?.[fieldKey]?.length < 7 && (
            <div className="text-red-500 text-sm mt-1">
              {getString('errors.licensePlate')}{' '}
            </div>
          )}
      </div>
    </>
  );
}

function FilterAutocomplete({
  config,
  currentData,
  handleChange,
  fieldKey,
  fallbackKey,
  fallbackOptions,
  fieldConfig,
}: Readonly<{
  config: any;
  currentData: any;
  handleChange: (key: string, value: any) => void;
  fieldKey: string;
  fallbackKey: string;
  fallbackOptions: any[];
  fieldConfig: FieldConfig;
}>) {
  const options = getFieldOptions(config, fieldKey, fallbackOptions);

  return (
    <>
      <div className="mb-4 font-bold">
        {getFieldTitle(config, fieldKey, fallbackKey)}
      </div>
      <Autocomplete
        data-testid={`autocomplete-${fieldKey}`}
        className="bg-[#FAFAFD]"
        multiple={fieldConfig?.isMultiSelect}
        title={getFieldTitle(config, fieldKey, fallbackKey)}
        options={options}
        value={
          fieldConfig?.isMultiSelect
            ? currentData?.[fieldKey]?.map((item: string) =>
                options.find(
                  (option: { value: string }) => option.value === item
                )
              )
            : options.find(
                (option: { value: string }) =>
                  option.value === currentData?.[fieldKey]
              )
        }
        onChange={(e: any) => {
          handleChange(
            fieldKey,
            fieldConfig?.isMultiSelect
              ? e.target.value?.map((item: { value: string }) => item.value)
              : e.target.value
          );
        }}
        name={fieldKey}
      />
    </>
  );
}

function SectionHeader({ title }: Readonly<{ title: string }>) {
  return (
    <h2 className="text-primary text-medium font-bold mb-3">
      {getString(title)}
    </h2>
  );
}

function FilterGrid({
  children,
  className = 'grid grid-cols-2 gap-2',
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return <div className={className}>{children}</div>;
}

function FilterField({
  config,
  currentData,
  handleChange,
  fieldConfig,
  abbreviation,
  preferredInsurersList,
  handleUpdateLead,
  dateWarning,
  isLicensePlateLoadingByProvince,
  policyHolderTypeUpdating,
}: Readonly<{
  config: any;
  currentData: any;
  handleChange: (
    key: string,
    value: any,
    callback?: (key: string, value: string) => void
  ) => void;
  fieldConfig: FieldConfig;
  abbreviation: string;
  preferredInsurersList: IInsurerItem[];
  handleUpdateLead: (key: string, value: any) => void;
  dateWarning: string;
  isLicensePlateLoadingByProvince: boolean;
  policyHolderTypeUpdating: boolean;
}>) {
  const { key, fallbackKey, type, fallbackOptions = [], name } = fieldConfig;

  const insurerOptions = preferredInsurersList.map((insurer) => ({
    id: insurer.id,
    title: insurer.displayName,
    value: insurer.id,
  }));

  let isDateDisabled = false;
  if (key === 'policyStartDate') {
    isDateDisabled = currentData?.insuranceKind === 'mandatory';
  } else if (key === 'compulsoryPolicyStartDate') {
    isDateDisabled = currentData?.insuranceKind === 'voluntary';
  }

  switch (type) {
    case 'select':
      if (key === 'numberOfFixedDriver') {
        return (
          <div>
            <div className="font-bold mb-1">
              {getFieldTitle(config, key, fallbackKey)} *
            </div>

            <SelectRegion
              data-testid={`select-region-${key}`}
              title=""
              value={currentData?.[key] ?? 0}
              onChange={(value) => handleChange(key, value, handleUpdateLead)}
              tooltipHelperText=""
              options={fallbackOptions}
              backgroundColor="#FFF"
            />
          </div>
        );
      }

      return (
        <FilterSelectRegion
          config={config}
          currentData={currentData}
          handleChange={(_key, value) =>
            handleChange(_key, value, handleUpdateLead)
          }
          fieldKey={key}
          fallbackKey={fallbackKey}
          fallbackOptions={fallbackOptions}
          asterisk={fieldConfig?.asterisk}
          policyHolderTypeUpdating={policyHolderTypeUpdating}
        />
      );
    case 'input':
      return (
        <FilterInput
          handleUpdateLead={handleUpdateLead}
          config={config}
          currentData={currentData}
          handleChange={handleChange}
          fieldKey={key}
          fallbackKey={fallbackKey}
          name={name || key}
          disabled={fieldConfig?.disabled ?? false}
        />
      );
    case 'date':
      return (
        <FilterDatePicker
          config={config}
          currentData={currentData}
          handleChange={(_key, value) =>
            handleChange(
              _key,
              value?.toISOString().split('T')?.[0],
              handleUpdateLead
            )
          }
          fieldKey={key}
          fallbackKey={fallbackKey}
          disabled={isDateDisabled || (fieldConfig?.disabled ?? false)}
          warning={
            [
              'policyStartDate',
              'compulsoryPolicyStartDate',
              'customerDOB',
              'policyHolderDOB',
            ].includes(key) && dateWarning
              ? dateWarning
              : undefined
          }
        />
      );
    case 'radio':
      return (
        <FilterRadio
          config={config}
          currentData={currentData}
          handleChange={(_key, value) =>
            handleChange(_key, value, handleUpdateLead)
          }
          fieldKey={key}
          fallbackKey={fallbackKey}
          fallbackOptions={fallbackOptions}
        />
      );
    case 'carLicensePlate':
      return (
        <FilterLicensePlate
          config={config}
          currentData={currentData}
          handleChange={handleChange}
          fieldKey={key}
          fallbackKey={fallbackKey}
          abbreviation={abbreviation}
          handleUpdateLead={handleUpdateLead}
          disabled={
            currentData?.redPlate === 'true' || isLicensePlateLoadingByProvince
          }
        />
      );
    case 'autocomplete':
      return (
        <FilterAutocomplete
          config={config}
          currentData={currentData}
          handleChange={(_key, value) =>
            handleChange(_key, value, handleUpdateLead)
          }
          fieldKey={key}
          fallbackKey={fallbackKey}
          fallbackOptions={
            key === 'currentInsurer' ? insurerOptions : fallbackOptions
          }
          fieldConfig={fieldConfig}
        />
      );
    default:
      return null;
  }
}

const fieldConfigs = {
  vehicle: {
    redPlate: {
      key: 'redPlate',
      fallbackKey: 'leadFilter.redPlate',
      type: 'radio' as const,
      fallbackOptions: defaultYesNoOptions,
    },
    carLicensePlate: {
      key: 'carLicensePlate',
      fallbackKey: 'leadFilter.licensePlate',
      type: 'carLicensePlate' as const,
      disabled: false,
    },
    chassisNumber: {
      key: 'chassisNumber',
      fallbackKey: 'leadFilter.chassisNo',
      type: 'input' as const,
      name: 'chassisNumber',
    },
    vehicleIdNumber: {
      key: 'vehicleIdNumber',
      fallbackKey: 'leadFilter.vehicleIdNo',
      type: 'input' as const,
      name: 'vehicleIdNumber',
    },
    carColor: {
      key: 'carColor',
      fallbackKey: 'leadFilter.carColor',
      type: 'autocomplete' as const,
      fallbackOptions: vehicleColorOptions,
      isMultiSelect: true,
    },
  },
  deals: {
    currentInsurer: {
      key: 'currentInsurer',
      fallbackKey: 'leadFilter.currentInsurer',
      type: 'autocomplete' as const,
      isMultiSelect: false,
    },
    insuranceKind: {
      key: 'insuranceKind',
      fallbackKey: 'leadDetailFields.insuranceKind',
      type: 'select' as const,
      fallbackOptions: getInsuranceKindOptions().map((option) => ({
        key: option.value,
        label: option.title,
      })),
    },
    policyStartDate: {
      key: 'policyStartDate',
      fallbackKey: 'leadFilter.volunPolicyStartDate',
      type: 'date' as const,
      disabled: false,
    },
    compulsoryPolicyStartDate: {
      key: 'compulsoryPolicyStartDate',
      fallbackKey: 'leadFilter.compPolicyStartDate',
      type: 'date' as const,
      disabled: false,
    },
  },
  customer: {
    customerFirstName: {
      key: 'customerFirstName',
      fallbackKey: 'leadFilter.firstName',
      type: 'input' as const,
      name: 'customerFirstName',
    },
    customerLastName: {
      key: 'customerLastName',
      fallbackKey: 'leadFilter.lastName',
      type: 'input' as const,
      name: 'customerLastName',
    },
    customerGender: {
      key: 'customerGender',
      fallbackKey: 'leadFilter.gender',
      type: 'select' as const,
      fallbackOptions: genderOptions,
    },
    customerDOB: {
      key: 'customerDOB',
      fallbackKey: 'leadFilter.dob',
      type: 'date' as const,
    },
    customerAge: {
      key: 'customerAge',
      fallbackKey: 'leadFilter.age',
      type: 'input' as const,
      disabled: true,
    },
    customerLanguage: {
      key: 'customerLanguage',
      fallbackKey: 'leadFilter.language',
      type: 'select' as const,
      fallbackOptions: languageOptions,
    },
  },
  policyHolder: {
    policyHolderType: {
      key: 'policyHolderType',
      fallbackKey: 'leadFilter.policyHolderType',
      type: 'select' as const,
      fallbackOptions: getPurchasingPurposeOptions(),
    },
    policyTitle: {
      key: 'policyTitle',
      fallbackKey: 'leadFilter.title',
      type: 'select' as const,
      isMultiSelect: false,
      fallbackOptions: leadTitleOptions().map((option) => ({
        key: option.value,
        label: option.title,
      })),
      asterisk: true,
    },
    policyHolderFirstName: {
      key: 'policyHolderFirstName',
      fallbackKey: 'leadFilter.firstName',
      type: 'input' as const,
      name: 'policyHolderFirstName',
    },
    policyHolderLastName: {
      key: 'policyHolderLastName',
      fallbackKey: 'leadFilter.lastName',
      type: 'input' as const,
      name: 'policyHolderLastName',
    },
    policyHolderNationalId: {
      key: 'policyHolderNationalId',
      fallbackKey: 'leadFilter.idPassport',
      type: 'input' as const,
      name: 'policyHolderNationalId',
    },
    policyHolderDOB: {
      key: 'policyHolderDOB',
      fallbackKey: 'leadFilter.dob',
      type: 'date' as const,
    },
    numberOfFixedDriver: {
      key: 'numberOfFixedDriver',
      fallbackKey: 'leadFilter.noFixedDriver',
      type: 'select' as const,
      fallbackOptions:
        ALLOWED_FIXED_DRIVER_COUNTS.map((option) => ({
          key: option,
          label: option,
        })) || [],
      asterisk: true,
    },
    policyHolderAge: {
      key: 'policyHolderAge',
      fallbackKey: 'leadFilter.age',
      type: 'input' as const,
      name: 'policyHolderAge',
      disabled: true,
    },
    policyHolderCompanyName: {
      key: 'policyHolderCompanyName',
      fallbackKey: 'leadDetailFields.companyName',
      type: 'input' as const,
      name: 'policyHolderCompanyName',
    },
    policyHolderTaxId: {
      key: 'policyHolderTaxId',
      fallbackKey: 'leadDetailFields.taxId',
      type: 'input' as const,
      name: 'policyHolderTaxId',
    },
  },
};

const sectionConfigs = [
  {
    title: 'leadFilter.vehicleDetails',
    fields: [
      { type: 'single', field: fieldConfigs.vehicle.redPlate },
      {
        type: 'grid',
        fields: [
          fieldConfigs.vehicle.carLicensePlate,
          fieldConfigs.vehicle.chassisNumber,
        ],
      },
      {
        type: 'grid',
        fields: [
          fieldConfigs.vehicle.vehicleIdNumber,
          fieldConfigs.vehicle.carColor,
        ],
      },
    ],
  },
  {
    title: 'leadFilter.dealsDetails',
    fields: [
      {
        type: 'grid',
        fields: [
          fieldConfigs.deals.currentInsurer,
          fieldConfigs.deals.insuranceKind,
        ],
      },
      {
        type: 'grid',
        fields: [
          fieldConfigs.deals.policyStartDate,
          fieldConfigs.deals.compulsoryPolicyStartDate,
        ],
      },
    ],
  },
  {
    title: 'leadFilter.customer',
    fields: [
      {
        type: 'grid',
        fields: [
          fieldConfigs.customer.customerFirstName,
          fieldConfigs.customer.customerLastName,
        ],
      },
      {
        type: 'mixed',
        fields: [
          fieldConfigs.customer.customerGender,
          fieldConfigs.customer.customerDOB,
        ],
      },
      {
        type: 'grid',
        fields: [
          fieldConfigs.customer.customerAge,
          fieldConfigs.customer.customerLanguage,
        ],
      },
    ],
  },
  {
    title: 'leadFilter.policyHolderInformation',
    fields: [
      { type: 'single', field: fieldConfigs.policyHolder.policyHolderType },
      { type: 'single', field: fieldConfigs.policyHolder.policyTitle },
      {
        type: 'grid',
        fields: [
          fieldConfigs.policyHolder.policyHolderFirstName,
          fieldConfigs.policyHolder.policyHolderLastName,
        ],
      },
      {
        type: 'mixed',
        fields: [
          fieldConfigs.policyHolder.policyHolderNationalId,
          fieldConfigs.policyHolder.policyHolderDOB,
        ],
      },
      {
        type: 'grid',
        fields: [
          fieldConfigs.policyHolder.policyHolderCompanyName,
          fieldConfigs.policyHolder.policyHolderTaxId,
        ],
      },
      {
        type: 'mixed',
        fields: [
          fieldConfigs.policyHolder.numberOfFixedDriver,
          fieldConfigs.policyHolder.policyHolderAge,
        ],
        className: 'grid grid-cols-2 gap-2',
      },
    ],
  },
];

function LeadFilterOptions({
  config,
  currentData: data,
  setCurrentData,
  leadData,
  setCurrentMultipleData,
}: Readonly<LeadFilterOptionsProps>) {
  const [showFixedDriverModal, setShowFixedDriverModal] = useState(false);
  const [isLeadInfoExpanded, setIsLeadInfoExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [policyStartDateWarning, setPolicyStartDateWarning] =
    useState<string>('');
  const [policyHolderTypeUpdating, setPolicyHolderTypeUpdating] =
    useState(false);
  const [
    compulsoryPolicyStartDateWarning,
    setCompulsoryPolicyStartDateWarning,
  ] = useState<string>('');
  const [customerDOBWarning, setCustomerDOBWarning] = useState<string>('');
  const [policyHolderDOBWarning, setPolicyHolderDOBWarning] =
    useState<string>('');
  const { updateLead, jsonUpdater } = useLeadUpdater(leadData?.name);
  const dispatch = useDispatch();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();
  useEffect(() => {
    dispatch(getListInsurer(LIST_INSURERS_PAGE_SIZE));
  }, [dispatch]);
  const { listInsurer } = useAppSelector((state) => ({
    listInsurer:
      state.leadsDetailReducer.getListInsurerReducer.data?.listInsurer,
  }));
  const [preferredInsurersList, setPreferredInsurersList] = useState<
    IInsurerItem[]
  >([]);
  const currentData = useMemo(
    () => data,
    [JSON.stringify(data), JSON.stringify(config)]
  );
  useEffect(() => {
    if (listInsurer)
      setPreferredInsurersList(sortPreferedInsurers(listInsurer.insurers));
  }, [listInsurer]);
  useEffect(() => {
    const { redPlate } = currentData;
    const clearIf = (condition: boolean, key: string) => {
      if (condition && currentData[key]) {
        setCurrentData(key, '');
        updateLead(`/${key}`, '');
      }
    };
    clearIf(redPlate === 'true', 'carLicensePlate');
    const calcAge = (dob?: string) => (dob ? getAgeByDOB(dob) : '');
    const syncAge = (dobKey: string, ageKey: string) => {
      const dob = currentData[dobKey];
      const age = currentData[ageKey];
      const newAge = calcAge(dob);
      if (dob && !Number.isNaN(newAge) && newAge !== age)
        setCurrentData(ageKey, newAge);
      else if (!dob && age) setCurrentData(ageKey, '');
    };
    syncAge('customerDOB', 'customerAge');
    syncAge('policyHolderDOB', 'policyHolderAge');
  }, [currentData, setCurrentData, updateLead]);

  const abbreviation = useMemo(() => {
    const provincesAbbreviations = provinceAbbreviationCollection();
    const province = provincesAbbreviations.find(
      (p) => p.oic === leadData?.data?.registeredProvince
    );
    return province?.abbreviation || '';
  }, [leadData]);

  const [isLicensePlateLoadingByProvince, setIsLicensePlateLoadingByProvince] =
    useState(false);

  useEffect(() => {
    if (currentData?.province && !currentData?.carLicensePlate) {
      setIsLicensePlateLoadingByProvince(true);
      setTimeout(() => {
        setIsLicensePlateLoadingByProvince(false);
      }, 2000);
    }
  }, [currentData?.province]);

  const handlePolicyHolderTypeChange = (type: string) =>
    handlePolicyHolderTypeChangeHelper(
      type,
      currentData,
      setCurrentMultipleData,
      updateLead
    );

  const handleChange = async (
    key: string,
    value: string,
    callback?: (k: string, v: string) => void
  ) => {
    if (
      !runValidation(
        key,
        value,
        setPolicyStartDateWarning,
        setCompulsoryPolicyStartDateWarning,
        setCustomerDOBWarning,
        setPolicyHolderDOBWarning
      )
    )
      return;

    if (
      ['customerFirstName', 'customerLastName', 'customerDOB'].includes(key) &&
      currentData?.policyHolderType === 'customer'
    ) {
      setCurrentMultipleData({
        [key]: value,
        policyHolderFirstName:
          key === 'customerFirstName' ? value : currentData.customerFirstName,
        policyHolderLastName:
          key === 'customerLastName' ? value : currentData.customerLastName,
        policyHolderDOB:
          key === 'customerDOB' ? value : currentData.customerDOB,
      });
    } else {
      setCurrentData(key, value);
    }

    if (key === 'policyHolderType') {
      setPolicyHolderTypeUpdating(true);
      const isSuccess = await handleUpdateLeadHelper(
        key,
        value,
        updateLead,
        jsonUpdater
      );
      if (isSuccess) {
        setIsOpen(true);
        dispatch(getLead({ leadName: leadData?.name }));
        setPolicyHolderTypeUpdating(false);
        handlePolicyHolderTypeChange(value);
      }
      return;
    }

    if (key === 'insuranceKind') {
      const isSuccess = await handleUpdateLeadHelper(
        key,
        value,
        updateLead,
        jsonUpdater
      );
      if (isSuccess) {
        dispatch(getLead({ leadName: leadData?.name }));
        showSuccessSnackbar(getString('text.updateLeadSuccess'));
      } else {
        showErrorSnackbar(getString('text.updateLeadFail'));
      }
      return;
    }

    if (key === 'numberOfFixedDriver' && parseInt(value, 10) > 0) {
      setShowFixedDriverModal(true);
    }

    callback?.(key, value);
  };

  const handleUpdateLead = (key: string, value: any) =>
    handleUpdateLeadHelper(key, value, updateLead, jsonUpdater);
  const renderField = (fieldConfig: FieldConfig) => {
    const { hidden, readOnly } = getFieldMeta(fieldConfig.key, currentData);
    if (hidden) return null;

    const getDateWarning = (fieldKey: string) => {
      switch (fieldKey) {
        case 'policyStartDate':
          return policyStartDateWarning;
        case 'compulsoryPolicyStartDate':
          return compulsoryPolicyStartDateWarning;
        case 'customerDOB':
          return customerDOBWarning;
        case 'policyHolderDOB':
          return policyHolderDOBWarning;
        default:
          return '';
      }
    };

    return (
      <div key={fieldConfig.key}>
        <FilterField
          handleUpdateLead={handleUpdateLead}
          config={config}
          currentData={currentData}
          handleChange={handleChange}
          fieldConfig={{
            ...fieldConfig,
            disabled: fieldConfig.disabled || readOnly,
          }}
          abbreviation={abbreviation}
          preferredInsurersList={preferredInsurersList}
          dateWarning={getDateWarning(fieldConfig.key)}
          isLicensePlateLoadingByProvince={isLicensePlateLoadingByProvince}
          policyHolderTypeUpdating={policyHolderTypeUpdating}
        />
      </div>
    );
  };

  const renderFieldGroup = (group: any) => {
    switch (group.type) {
      case 'single':
        return renderField(group.field);
      case 'grid':
        return (
          <FilterGrid
            key={group.fields.map((f: FieldConfig) => f.key).join('-')}
          >
            {group.fields.map(renderField)}
          </FilterGrid>
        );
      case 'mixed':
        return (
          <FilterGrid
            key={group.fields.map((f: FieldConfig) => f.key).join('-')}
            className={group.className || 'grid grid-cols-2 gap-2'}
          >
            {group.fields.map(renderField)}
          </FilterGrid>
        );
      default:
        return null;
    }
  };
  return (
    <div data-testid="lead-filter-options">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-primary text-lg underline">
          {getString('leadFilter.leadInfo')}
        </h1>
        <button
          type="button"
          onClick={() => setIsLeadInfoExpanded(!isLeadInfoExpanded)}
          className="flex items-center justify-center w-8 h-8 bg-white rounded-md hover:bg-gray-50 transition-colors border-none"
          data-testid="lead-info-toggle"
        >
          <ChevronLeftOutlined
            className={`text-primary transition-transform duration-300 ease-in-out ${
              isLeadInfoExpanded ? 'rotate-90' : '-rotate-90'
            }`}
          />
        </button>
      </div>

      {isLeadInfoExpanded &&
        sectionConfigs.map((section) => (
          <FormSection key={section.title}>
            <SectionHeader title={section.title} />
            <div className="bg-[#FAFAFD] p-2 space-y-3">
              {section.fields.map(renderFieldGroup)}
              {currentData?.numberOfFixedDriver > 0 &&
                section.title === 'leadFilter.policyHolderInformation' &&
                Array.from({ length: currentData.numberOfFixedDriver }).map(
                  (_, i) => (
                    <button
                      key={`fixed-driver-${getString('leadFilter.fixedDriver')}-${i + 1}`}
                      className="text-primary cursor-pointer flex items-center hover:bg-gray-100 p-2 rounded border-none bg-transparent w-full text-left"
                      data-testid={`fixed-driver-${i + 1}`}
                      onClick={() => setShowFixedDriverModal(true)}
                      type="button"
                    >
                      {i === 0 && getString('leadDetailFields.firstDriverName')}
                      {i === 1 &&
                        getString('leadDetailFields.secondDriverName')}{' '}
                      &nbsp; &nbsp;
                      <OpenIcon />
                    </button>
                  )
                )}
              <br />
            </div>
          </FormSection>
        ))}

      <br />
      <br />
      <br />

      <FixedDriverModal
        openModal={showFixedDriverModal}
        handleCloseModal={() => setShowFixedDriverModal(false)}
        title={getString('leadDetailFields.fixedDriver')}
        leadData={leadData}
        isDisabled={false}
      />

      <MutationResponseDialog
        isOpen={isOpen}
        content={getString('text.policyHolderSwitchWarning')}
        title={getString('text.policyHolderInformation')}
        blueTitle={getString('text.updatedInformation')}
        setIsOpen={setIsOpen}
        id="policyHolderUpdated"
        icon={<SuccessIcon fontSize="large" className="mt-6" />}
        actionButton={
          <Button
            className="uppercase w-32 border-0 !border-primary mt-2 hover:opacity-90 h-10 text-white font-sans"
            onClick={() => setIsOpen(false)}
            dataTestId="address-btn"
            text={getString('text.close')}
          />
        }
      />
    </div>
  );
}

export default LeadFilterOptions;
