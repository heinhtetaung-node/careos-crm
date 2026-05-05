import { YesNoOptions } from '../../leads/LeadDashBoard/LeadDashBoard.helper';

export default {
  sort: {
    title: 'leadPackageFilter.sortBy',
    tooltip: 'leadPackageFilter.tooltip.sortBy',
    type: 'selectbox',
    values: [
      { key: 'default', label: 'text.select' },
      { key: 'brand', label: 'leadPackageFilter.sortByOptions.brand' },
      { key: 'price', label: 'leadPackageFilter.sortByOptions.price' },
      {
        key: 'sumInsured',
        label: 'leadPackageFilter.sortByOptions.sumInsured',
      },
    ],
  },
  order: {
    title: 'leadPackageFilter.orderBy',
    tooltip: '',
    type: 'selectbox',
    values: [{ key: 'default', label: 'text.select' }],
  },
  paymentOption: {
    title: 'leadPackageFilter.paymentOption',
    tooltip: 'leadPackageFilter.tooltip.paymentOption',
    type: 'selectbox',
    options: [] as { key: string; label: string }[],
  },
  installment: {
    title: 'leadPackageFilter.numberOfInstallment',
    tooltip: 'leadPackageFilter.tooltip.installmentOption',
    type: 'selectbox',
    options: [] as { key: string; label: string }[],
  },
  insuranceType: {
    title: 'leadPackageFilter.insuranceType',
    tooltip: 'leadPackageFilter.tooltip.insuranceType',
    type: 'checkbox',
    values: [
      {
        key: 'Type 1',
        label: 'leadPackageFilter.possibleValue.insuranceType.type1',
      },
      {
        key: 'Type 2+',
        label: 'leadPackageFilter.possibleValue.insuranceType.type2+',
      },
      {
        key: 'Type 3+',
        label: 'leadPackageFilter.possibleValue.insuranceType.type3+',
      },
      {
        key: 'Type 2',
        label: 'leadPackageFilter.possibleValue.insuranceType.type2',
      },
      {
        key: 'Type 3',
        label: 'leadPackageFilter.possibleValue.insuranceType.type3',
      },
      {
        key: 'mandatory',
        label: 'leadPackageFilter.possibleValue.insuranceType.compulsory',
      },
    ],
  },
  insurer: {
    title: 'leadPackageFilter.insurer',
    tooltip: 'leadPackageFilter.tooltip.insurer',
    type: 'checkbox',
    values: [{ key: 'insurers/1', label: 'Bangkok Insurance', logo: '' }],
  },
  repairType: {
    title: 'leadPackageFilter.repairType',
    tooltip: 'leadPackageFilter.tooltip.repairType',
    type: 'checkbox',
    values: [
      {
        key: 'Dealer',
        label: 'leadPackageFilter.possibleValue.repairType.dealer',
      },
      {
        key: 'Garage',
        label: 'leadPackageFilter.possibleValue.repairType.garage',
      },
    ],
  },
  sumInsured: {
    title: 'leadPackageFilter.sumInsured',
    tooltip: 'leadPackageFilter.tooltip.sumInsured',
    type: 'slidebar',
    config: {
      min: 0,
      max: 1,
      step: 1,
    },
  },
  price: {
    title: 'leadPackageFilter.price',
    tooltip: 'leadPackageFilter.tooltip.price',
    type: 'slidebar',
    config: {
      min: 0,
      max: 0,
      step: 1,
    },
  },
  deductible: {
    title: 'leadPackageFilter.deductible',
    tooltip: 'leadPackageFilter.tooltip.deductible',
    type: 'checkbox',
    values: [
      {
        key: 'no_deductible',
        label: 'leadPackageFilter.possibleValue.deductible.noDeductible',
      },
      {
        key: 'only_deductible',
        label: 'leadPackageFilter.possibleValue.deductible.onlyDeductible',
      },
    ],
  },
  brand: {
    title: 'leadDetailFields.brand',
    tooltip: '',
    type: 'selectbox',
    options: [
      {
        key: '',
        label: 'Please Select',
      },
    ],
  },
  subModel: {
    title: 'leadDetailFields.subModel',
    tooltip: '',
    type: 'selectbox',
    options: [
      {
        key: '',
        label: 'Please Select',
      },
    ],
  },
  model: {
    title: 'leadDetailFields.model',
    tooltip: '',
    type: 'selectbox',
    options: [
      {
        key: '',
        label: 'Please Select',
      },
    ],
  },
  year: {
    title: 'leadDetailFields.year',
    tooltip: '',
    type: 'selectbox',
    options: [
      {
        key: '',
        label: 'Please Select',
      },
    ],
  },
  province: {
    title: 'leadDetailFields.province',
    tooltip: '',
    type: 'selectbox',
    options: [
      {
        key: '',
        label: 'Please Select',
      },
    ],
  },
  dashCam: {
    title: 'leadDetailFields.dashCam',
    tooltip: '',
    type: 'radio',
    options: YesNoOptions.map((opt) => ({
      ...opt,
      key: opt.value,
      label: opt.title,
    })),
  },
  modification: {
    title: 'leadDetailFields.modification',
    tooltip: '',
    type: 'radio',
    options: ['yes', 'no'].map((opt, index) => ({
      key: opt + index,
      label: `text.${opt}`,
      value: opt === 'yes' ? 'true' : 'false',
    })),
  },
  drivingPurpose: {
    title: 'leadDetailFields.drivingPurpose',
    tooltip: '',
    type: 'radio',
    options: ['personal', 'commercial'].map((opt, index) => ({
      key: opt + index,
      label: `text.${opt}`,
      value: opt.toUpperCase(),
    })),
  },
  noOfDoors: {
    title: 'leadDetailFields.noOfDoor',
    tooltip: '',
    type: 'selectbox',
    options: [
      {
        key: '',
        label: 'Please Select',
      },
    ],
  },
  engineSize: {
    title: 'leadDetailFields.engineSize',
    tooltip: '',
    type: 'selectbox',
    options: [
      {
        key: '',
        label: 'Please Select',
      },
    ],
  },
};
