import React from 'react';

import { RedirectIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';

import Controls from 'presentation/components/controls/Control';

import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import { Column } from 'presentation/hooks/useTableList';

import {
  AssignmentTurnedInOutlined,
  CancelOutlined,
  CheckCircleOutline,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  Update,
} from '@material-ui/icons';
import {
  assignAbleUser,
  discountAbleUser,
  exportAbleUser,
  importAbleUser,
  rejectAbleUser,
  underwritingAbleUser,
} from 'config/constant';
import { camelCase } from 'lodash';
import { localeLeadType } from 'presentation/pages/car-insurance/leads/LeadDashBoard';
import {
  RejectedLead,
  trueFalseOptions,
} from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getSourceOptions } from 'presentation/pages/car-insurance/leads/LeadSourcePage/leadSourceHelper';
import { getLanguage, getString } from 'presentation/theme/localization';
import { genderOptions, languageOptions } from 'shared/helper/selectOptions';

import { UnderwritingStatusOption } from '../leadDetailsPage/helper';
import { LeadStatusOptions } from './helper';
import {
  productCategory,
  productSubCategory,
} from '../PackageListingPage/filterConfig';

export const ActionButtonConfigs = ({
  navigate,
  handleModal,
  data,
  role,
}: any) => {
  const { selected } = data;

  const assignAbleUserCheck = assignAbleUser.includes(role)
    ? [
        {
          id: '1',
          name: 'Assign Lead',
          onClick: () => handleModal({ type: 'assign', show: true, data }),
          actionElem: <AssignmentTurnedInOutlined color="primary" />,
        },
      ]
    : [];
  const rejectAbleUserCheck = rejectAbleUser.includes(role)
    ? [
        {
          id: '2',
          name: 'Reject Lead',
          onClick: () => navigate('/health/leads/rejection'),
          actionElem: <CancelOutlined color="primary" />,
        },
      ]
    : [];
  const importAbleUserCheck = importAbleUser.includes(role)
    ? [
        {
          id: '3',
          name: 'Import Lead',
          onClick: () => navigate('/health/leads/import'),
          actionElem: <CloudUploadOutlined color="primary" />,
        },
      ]
    : [];
  const exportAbleUserCheck = exportAbleUser.includes(role)
    ? [
        {
          id: '4',
          name: 'Export Lead',
          onClick: () => null,
          actionElem: <CloudDownloadOutlined color="primary" />,
        },
      ]
    : [];
  const underwritingAbleUserCheck = underwritingAbleUser.includes(role)
    ? [
        {
          id: '5',
          name: 'Update Underwriting Status',
          onClick: () =>
            handleModal({
              title: `Update Underwriting Status of ${selected?.length ?? 0} leads`,
              type: 'underwriting',
              show: true,
            }),
          actionElem: <Update color="primary" />,
        },
      ]
    : [];

  const discountAbleUserCheck = discountAbleUser.includes(role)
    ? [
        {
          id: '6',
          name: 'Discount Approval',
          onClick: () => navigate('/health/discounts/approval'),
          actionElem: <CheckCircleOutline color="primary" />,
        },
      ]
    : [];

  return [
    ...assignAbleUserCheck,
    ...rejectAbleUserCheck,
    ...importAbleUserCheck,
    ...exportAbleUserCheck,
    ...underwritingAbleUserCheck,
    ...discountAbleUserCheck,
  ];
};

type InsurerLocale = {
  shortnameEn: string;
  shortnameTh: string;
};

const getInsurerNameLocale = (insurer: InsurerLocale) =>
  getLanguage() === 'en' ? insurer.shortnameEn : insurer.shortnameTh;

export const getFields: (
  searchAssignedUser: (data: any) => Promise<any>,
  sourceInfo: {
    sourceLoading: boolean;
    sources: any;
    agentList: { users: any[] };
    insurers: any[];
    role?: string;
  }
) => IFilterFormField[] = (searchAssignedUser, sourceInfo) => [
  // Lead Information
  {
    InputComponent: (params: any) => (
      <MultiDateRangeWithType
        {...params}
        options={[
          {
            id: 2,
            title: getString('dateTypeLeadOption.createOn'),
            value: 'lead.createTime',
          },
          {
            id: 3,
            title: getString('dateTypeLeadOption.updateOn'),
            value: 'lead.updateTime',
          },
          {
            id: 4,
            title: getString('dateTypeLeadOption.assignOn'),
            value: 'assigned.createTime',
          },
          {
            id: 5,
            title: getString('dateTypeLeadOption.policyStartOn'),
            value: 'insurance.policyStartDate',
          },
          {
            id: 7,
            title: getString('dateTypeLeadOption.policyExpiryOn'),
            value: 'insurance.policyExpiryDate',
          },
          {
            id: 8,
            title: getString('dateTypeLeadOption.appointedOn'),
            value: 'appointments[].startTime',
          },
        ]}
      />
    ),
    inputProps: {
      name: 'date',
      label: '',
      value: '',
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 9,
      },
      hasExpand: true,
    },
  },
  {
    InputComponent: React.memo(Controls.Autocomplete),
    inputProps: {
      name: 'leadSource',
      label: getString('text.source'),
      options: getSourceOptions(sourceInfo.sources ?? [], 'source', false).map(
        (sourceOption) => ({
          ...sourceOption,
          value: sourceOption.name,
        })
      ),
      loading: sourceInfo.sourceLoading,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'leadStatus',
      label: getString('text.leadStatus'),
      options: LeadStatusOptions.filter((opt) => opt.id !== 7),
      filterType: 'summary',
      hasSelectAll: true,
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  ...(assignAbleUser.includes(sourceInfo?.role || '')
    ? ([
        {
          InputComponent: Controls.Autocomplete,
          inputProps: {
            name: 'agentName',
            label: getString('healthLead.agentName'),
            options: sourceInfo.agentList,
            filterType: 'summary',
            fixedLabel: true,
            responsive: {
              xs: 6,
              md: 4,
            },
          },
        },
      ] as any)
    : []),
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'leadType',
      label: getString('text.leadType'),
      options: localeLeadType,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },

  // Customer
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'customerGender',
      label: getString('healthLead.customerGender'),
      options: genderOptions,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Input,
    inputProps: {
      name: 'customerAge',
      label: getString('healthLead.customerAge'),
      placeholder: '30',
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 12,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'customerLanguage',
      label: getString('healthLead.customerLanguage'),
      options: languageOptions,
      filterType: 'summary',
      hasSelectAll: true,
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'consentPersonalizedOffersAndCommunication',
      label: getString('healthLead.consentPersonalizedOffers'),
      options: trueFalseOptions,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'consentOffersFromOurBusinessPartners',
      label: getString('healthLead.consentBusinessPartners'),
      options: trueFalseOptions,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'consentDataAnalytics',
      label: getString('healthLead.consentDataAnalytics'),
      options: trueFalseOptions,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },

  // Policy Holder Information
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'policyHolderGender',
      label: getString('healthLead.policyHolderGender'),
      options: genderOptions,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Input,
    inputProps: {
      name: 'policyHolderAge',
      label: getString('healthLead.policyHolderAge'),
      placeholder: '30',
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 12,
        md: 4,
      },
    },
  },

  // Beneficiary's Person Fields
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'beneficiaryGender',
      label: getString('healthLead.beneficiaryGender'),
      options: genderOptions,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },

  // Insurance
  ...['currentInsurer', 'preferredInsurer'].map((key) => ({
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: key,
      label: getString(`healthLead.${key}`),
      options: sourceInfo?.insurers?.map((insurer) => ({
        title: getInsurerNameLocale(insurer),
        value: insurer.name.split('/')[1],
        label: getInsurerNameLocale(insurer),
      })),
      filterType: 'summary',
      hasSelectAll: true,
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  })),

  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'preferredProductCategory',
      label: getString('healthLead.preferredProductCategory'),
      options: productCategory().filter((category) => category.value !== ''),
      filterType: 'summary',
      hasSelectAll: true,
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'preferredProductType',
      label: getString('healthLead.subCategory'),
      options: productSubCategory().filter((category) => category.value !== ''),
      filterType: 'summary',
      hasSelectAll: true,
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },

  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'deliveryOption',
      label: getString('healthLead.deliveryOption'),
      options: [
        {
          label: 'kerryStandard',
          value: 'deliveryOptions/kerry-standard',
          title: getString('qc.kerryStandard'),
        },
        {
          label: 'digitalDelivery',
          value: 'deliveryOptions/digital-delivery',
          title: getString('qc.digitalDelivery'),
        },
        {
          label: 'kerryExpress',
          value: 'deliveryOptions/kerry-express',
          title: getString('qc.kerryExpress'),
        },
      ],
      filterType: 'summary',
      hasSelectAll: true,
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'underwritingStatus',
      label: getString('healthLead.underwritingStatus'),
      options: UnderwritingStatusOption(),
      filterType: 'summary',
      hasSelectAll: true,
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Slider,
    inputProps: {
      name: 'callAttempts',
      label: getString('text.callAttempts'),
      min: 0,
      max: 2000,
      step: 1,
      marks: false,
      isPlaceHolder: false,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
  {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'rejectedLead',
      label: getString('lead.rejectedLead'),
      options: RejectedLead.map((type) => ({
        ...type,
        title: getString(type.title),
      })),
      selectField: 'value',
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
        md: 4,
      },
    },
  },
];
export const columns: (
  showColumns: string[],
  navigate?: (url: string) => void,
  selectedListView?: string
) => Column[] = (showColumns, navigate, selectedListView) =>
  [
    // lead information
    {
      id: 'id',
      label: '',
      disabled: true,
      clickable: true,
      minWidth: 80,
      customField: true,
      transform: (row: any) => (
        <Button
          className="flex justify-between items-center flex-row-reverse !rounded-[50px] p-1"
          onClick={() => navigate?.(`/health/${row.id}`)}
          text=""
          icon={<RedirectIcon color="white" className="p-1 h-6 w-6" />}
        />
      ),
    },
    // Lead Information
    {
      id: 'leadStatus',
      label: getString(`healthLead.${camelCase('Lead Status')}`),
      sorting: 'none',
      minWidth: 200,
      field: 'lead.status',
    },
    {
      id: 'createTime',
      label: getString(`text.${camelCase('Created on')}`),
      sorting: 'none',
      minWidth: 200,
      field: 'lead.createTime',
    },
    ...(selectedListView === 'allLeads' || selectedListView === 'myLeads' // || selectedListView === 'myLeads' can hide later
      ? [
          {
            id: 'agentName',
            label: getString(`healthLead.${camelCase('Agent Name')}`),
            sorting: 'none',
            disabled: true,
            minWidth: 150,
          },
        ]
      : []),
    {
      id: 'remark',
      label: getString('lead.remark'),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'insurerProduct',
      label: getString('healthLead.insurerProduct'),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'leadId',
      label: getString(`healthLead.leadID`),
      sorting: 'desc',
      minWidth: 150,
      field: 'lead.humanId',
    },
    {
      id: 'leadType',
      label: getString(`healthLead.${camelCase('Lead Type')}`),
      sorting: 'none',
      minWidth: 150,
      field: 'lead.type',
    },
    {
      id: 'leadSource',
      label: getString(`healthLead.${camelCase('Lead Source')}`),
      sorting: 'none',
      minWidth: 150,
      field: 'source.source',
    },
    {
      id: 'appointmentDate',
      field: 'appointments.startTime',
      label: 'text.appointmentDate',
      minWidth: 180,
      sorting: 'none',
    },
    {
      id: 'callAttempts',
      field: 'attributes.callAttempts',
      label: 'text.callAttempts',
      minWidth: 150,
      sorting: 'none',
    },
    {
      id: 'lastCallDate',
      field: 'attributes.lastCallTimestamp',
      label: 'text.lastCallDate',
      format: 'date',
      minWidth: 200,
      sorting: 'none',
    },
    {
      id: 'daysSinceLastCall',
      field: 'daysSinceLastCall',
      label: 'text.daysSinceLastCall',
      minWidth: 150,
      disabled: true,
    },
    // {
    //   id: 'callOnSundayHoliday',
    //   label: getString(`healthLead.${camelCase('Call on Sunday & Holiday')}`),
    //   sorting: 'none',
    //   minWidth: 200,
    // },
    {
      id: 'preferredCallDateTime',
      label: getString(`healthLead.${camelCase('Preferred Call DateTime')}`),
      sorting: 'none',
      disabled: true,
      minWidth: 200,
    },
    {
      id: 'refId',
      label: getString(`healthLead.referenceID`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'isThaiNational',
      label: getString(`healthLead.isThaiNational`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },

    // Customer Information
    {
      id: 'customerTitle',
      label: getString(`healthLead.${camelCase('Customer Title')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'customerFirstName',
      label: getString(`healthLead.${camelCase('Customer First Name')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'customerLastName',
      label: getString(`healthLead.${camelCase('Customer Last Name')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'customerGender',
      label: getString(`healthLead.${camelCase('Customer Gender')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'customerDOB',
      label: getString(`healthLead.${camelCase('Customer Date of Birth')}`),
      sorting: 'none',
      minWidth: 200,
      field: 'lead.data.customer.dob',
    },
    {
      id: 'customerAge',
      label: getString(`healthLead.${camelCase('Customer Age')}`),
      sorting: 'none',
      minWidth: 150,
      field: 'lead.data.customer.dob',
    },
    {
      id: 'customerLanguage',
      label: getString(`healthLead.${camelCase('Customer Language')}`),
      sorting: 'none',
      minWidth: 150,
      field: 'lead.data.policyHolder.locale',
    },
    {
      id: 'customerPhoneNumber',
      label: getString(`healthLead.${camelCase('Customer Phone Number')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'customerEmail',
      label: getString(`healthLead.${camelCase('Customer Email')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'consentTerms',
      label: getString(
        `healthLead.${camelCase('Consent Terms and Conditions')}`
      ),
      sorting: 'none',
      minWidth: 250,
      disabled: true,
    },
    {
      id: 'consentOffers',
      label: getString(
        `healthLead.${camelCase('Consent Personalized Offers')}`
      ),
      sorting: 'none',
      minWidth: 250,
      disabled: true,
    },
    {
      id: 'consentBusinessPartners',
      label: getString(`healthLead.${camelCase('Consent Business Partners')}`),
      sorting: 'none',
      minWidth: 250,
      disabled: true,
    },
    {
      id: 'consentDataAnalytics',
      label: getString(`healthLead.${camelCase('Consent Data Analytics')}`),
      sorting: 'none',
      minWidth: 250,
      disabled: true,
    },

    // Policy Holder Information
    {
      id: 'policyHolderTitle',
      label: getString(`healthLead.${camelCase('Policy Holder Title')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'policyHolderFirstName',
      label: getString(`healthLead.${camelCase('Policy Holder First Name')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'policyHolderLastName',
      label: getString(`healthLead.${camelCase('Policy Holder Last Name')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'policyHolderGender',
      label: getString(`healthLead.${camelCase('Policy Holder Gender')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'policyHolderDOB',
      label: getString(
        `healthLead.${camelCase('Policy Holder Date of Birth')}`
      ),
      sorting: 'none',
      minWidth: 200,
      field: 'lead.data.policyHolder.dob',
    },
    {
      id: 'policyHolderAge',
      label: getString(`healthLead.${camelCase('Policy Holder Age')}`),
      sorting: 'none',
      minWidth: 150,
      field: 'lead.data.policyHolder.dob',
    },
    {
      id: 'policyHolderRace',
      label: getString(`healthLead.${camelCase('Policy Holder Race')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'policyHolderNationalId',
      label: getString(`healthLead.${camelCase('Policy Holder National ID')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'policyHolderPassport',
      label: getString(`healthLead.${camelCase('Policy Holder Passport')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'policyHolderOccupation',
      label: getString(`healthLead.${camelCase('Policy Holder Occupation')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'policyHolderJobDescription',
      label: getString(
        `healthLead.${camelCase('Policy Holder Job Description')}`
      ),
      sorting: 'none',
      minWidth: 250,
      disabled: true,
    },
    {
      id: 'policyHolderPhoneNumber',
      label: getString(`healthLead.${camelCase('Policy Holder Phone Number')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'policyHolderEmail',
      label: getString(`healthLead.${camelCase('Policy Holder Email')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },

    // Beneficiary Information
    {
      id: 'beneficiaryTitle',
      label: getString(`healthLead.${camelCase('Beneficiary Title')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'beneficiaryFirstName',
      label: getString(`healthLead.${camelCase('Beneficiary First Name')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'beneficiaryLastName',
      label: getString(`healthLead.${camelCase('Beneficiary Last Name')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'beneficiaryGender',
      label: getString(`healthLead.${camelCase('Beneficiary Gender')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'beneficiaryRelationship',
      label: getString(`healthLead.${camelCase('Beneficiary Relationship')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'beneficiaryPhoneNumber',
      label: getString(`healthLead.${camelCase('Beneficiary Phone Number')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'beneficiaryEmail',
      label: getString(`healthLead.${camelCase('Beneficiary Email')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },

    // Insurance Information
    {
      id: 'currentInsurer',
      label: getString(`healthLead.${camelCase('Current Insurer')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'preferredInsurer',
      label: getString(`healthLead.${camelCase('Preferred Insurer')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'preferredProductCategory',
      label: getString(`healthLead.${camelCase('Preferred Product Category')}`),
      sorting: 'none',
      minWidth: 200,
      field: 'lead.data.insurance.category',
    },
    {
      id: 'subCategory',
      label: getString(`healthLead.${camelCase('Sub Category')}`),
      sorting: 'none',
      minWidth: 200,
      field: 'lead.data.insurance.subCategory',
    },
    {
      id: 'preferredProductType',
      label: getString(`healthLead.${camelCase('Preferred Product Type')}`),
      sorting: 'none',
      minWidth: 200,
      field: 'lead.data.insurance.type',
    },
    {
      id: 'preferredCoverageItems',
      label: getString(`healthLead.${camelCase('Preferred Coverage Items')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'preferredPolicyStartDate',
      label: getString(
        `healthLead.${camelCase('Preferred Policy Start Date')}`
      ),
      sorting: 'none',
      minWidth: 200,
      field: 'insurance.policyStartDate',
    },
    {
      id: 'deliveryOption',
      label: getString(`healthLead.${camelCase('Delivery Option')}`),
      sorting: 'none',
      minWidth: 150,
      field: 'lead.data.checkout.deliveryOption',
    },
    {
      id: 'underwritingStatus',
      label: getString(`healthLead.${camelCase('Underwriting Status')}`),
      sorting: 'none',
      minWidth: 200,
      field: 'attributes.underwritingStatus',
    },
    {
      id: 'insurancePhoneNumber',
      label: getString(`healthLead.${camelCase('Insurance Phone Number')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'insuranceEmail',
      label: getString(`healthLead.${camelCase('Insurance Email')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },

    // Policy Address
    {
      id: 'policyAddress',
      label: getString(`healthLead.${camelCase('Policy Address')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'policyProvince',
      label: getString(`healthLead.${camelCase('Policy Province')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'policyDistrict',
      label: getString(`healthLead.${camelCase('Policy District')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'policySubDistrict',
      label: getString(`healthLead.${camelCase('Policy Sub District')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'policyPostalCode',
      label: getString(`healthLead.${camelCase('Policy Postal Code')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },

    // Billing Address
    {
      id: 'billingAddress',
      label: getString(`healthLead.${camelCase('Billing Address')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'billingProvince',
      label: getString(`healthLead.${camelCase('Billing Province')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'billingDistrict',
      label: getString(`healthLead.${camelCase('Billing District')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'billingSubDistrict',
      label: getString(`healthLead.${camelCase('Billing Sub District')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'billingPostalCode',
      label: getString(`healthLead.${camelCase('Billing Postal Code')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },

    // Shipping Address
    {
      id: 'shippingAddress',
      label: getString(`healthLead.${camelCase('Shipping Address')}`),
      sorting: 'none',
      minWidth: 200,
      disabled: true,
    },
    {
      id: 'shippingProvince',
      label: getString(`healthLead.${camelCase('Shipping Province')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'shippingDistrict',
      label: getString(`healthLead.${camelCase('Shipping District')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'shippingSubDistrict',
      label: getString(`healthLead.${camelCase('Shipping Sub District')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
    {
      id: 'shippingPostalCode',
      label: getString(`healthLead.${camelCase('Shipping Postal Code')}`),
      sorting: 'none',
      minWidth: 150,
      disabled: true,
    },
  ].filter((col) => showColumns.includes(col.id)) as Column[];
