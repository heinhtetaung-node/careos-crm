import {
  DuplicateLead,
  SearchFieldLeadAll,
  StatusLeadAll,
} from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getString } from 'presentation/theme/localization';
import {
  transformUrlQueryMultiSelect,
  transformUrlQuerySearch,
  transformUrlQuerySearchTrueFalse,
} from 'presentation/pages/car-insurance/CarePay/Contracts/helper';
import { sourceNotContainPredefinedFilter } from 'mock-data/healthTeamsAndSources';
import { UserRoles } from 'config/constant';

export const defaultModalState = {
  title: '',
  type: '',
  show: false,
  size: 'xs',
  titleCenter: true,
  data: {},
};

export const defaultColumnsToShow = [
  'id',
  'leadStatus',
  'createTime',
  'agentName',
  'remark',
  'insurerProduct',
  'leadId',
  'leadType',
  'leadSource',
  'appointmentDate',
  'callAttempts',
  'lastCallDate',
  'daysSinceLastCall',
  'callOnSundayHoliday',
  'preferredCallDateTime',
  'refId',
  'isThaiNational',
  'customerTitle',
  'customerFirstName',
  'customerLastName',
  'customerGender',
  'customerDOB',
  'customerAge',
  'customerLanguage',
  'customerPhoneNumber',
  'customerEmail',
  'consentTerms',
  'consentOffers',
  'consentBusinessPartners',
  'consentDataAnalytics',
  'policyHolderTitle',
  'policyHolderFirstName',
  'policyHolderLastName',
  'policyHolderGender',
  'policyHolderDOB',
  'policyHolderAge',
  'policyHolderRace',
  'policyHolderNationalId',
  'policyHolderPassport',
  'policyHolderOccupation',
  'policyHolderJobDescription',
  'policyHolderPhoneNumber',
  'policyHolderEmail',
  'beneficiaryTitle',
  'beneficiaryFirstName',
  'beneficiaryLastName',
  'beneficiaryGender',
  'beneficiaryRelationship',
  'beneficiaryPhoneNumber',
  'beneficiaryEmail',
  'currentInsurer',
  'preferredInsurer',
  'preferredProductCategory',
  'subCategory',
  'preferredProductType',
  'preferredCoverageItems',
  'preferredPolicyStartDate',
  'deliveryOption',
  'underwritingStatus',
  'insurancePhoneNumber',
  'insuranceEmail',
  'policyAddress',
  'policyProvince',
  'policyDistrict',
  'policySubDistrict',
  'policyPostalCode',
  'billingAddress',
  'billingProvince',
  'billingDistrict',
  'billingSubDistrict',
  'billingPostalCode',
  'shippingAddress',
  'shippingProvince',
  'shippingDistrict',
  'shippingSubDistrict',
  'shippingPostalCode',
];

export const initialFilterValues = {
  search: { key: '', value: '' },
  date: {
    startDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
    endDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
  },
  preferredPolicyStartDate: {
    startDate: null,
    endDate: null,
  },
  source: [],
  leadStatus: [],
  leadType: [],
  assignToUser: [],
  assignToTeam: [],
  sumInsured: [0, 0],
  lastPremium: [0, 0],
  duplicateLead: '',
  rejectionReasons: [],
  rejectedLead: '',
  insuranceType: [],
};

export const HealthInsuranceType = [
  {
    id: 0,
    title: getString('insuranceTypes.health'),
    value: '0',
  },
  { id: 1, title: getString('insuranceTypes.criticalIllness'), value: '1' },
  {
    id: 2,
    title: getString('insuranceTypes.accident'),
    value: '2',
  },
];

export const YesNoAllOptions = DuplicateLead.map((option: any) => ({
  ...option,
  title: getString(option.title),
}));

export const SearchOptions = [
  ...SearchFieldLeadAll.filter((_field: any) => ![6, 7, 8].includes(_field.id)),
  {
    id: 6,
    title: getString('searchFieldLeadOption.policyholderId'),
    value: '',
  },
].map((searchField) => ({
  ...searchField,
  title: getString(searchField.title),
}));

export const LeadStatusOptions = StatusLeadAll.map((type: any) => ({
  ...type,
  title: getString(type.title),
}));

export const transformUrlRejectedLead = (url: string, rejectedLead: string) => {
  if (
    rejectedLead?.toString() !== 'all' &&
    ['true', 'false'].includes(rejectedLead)
  ) {
    url += transformUrlQuerySearchTrueFalse(
      url,
      { selectValue: 'lead.isRejected', inputValue: rejectedLead },
      '='
    );
  } else {
    url += transformUrlQueryMultiSelect(
      url,
      [{ value: 'true' }, { value: 'false' }],
      'lead.isRejected'
    );
  }
  return url;
};

export const addNotPurchaseAndNotRejectedFilter = (querySearch: string) => {
  // Lead Status != Purchase
  querySearch += transformUrlQuerySearch(
    querySearch,
    {
      selectValue: 'lead.status',
      inputValue: 'LEAD_STATUS_PURCHASED',
    },
    '!='
  );

  // Is Rejected != TRUE
  querySearch += transformUrlQuerySearchTrueFalse(
    querySearch,
    { selectValue: 'lead.isRejected', inputValue: true },
    '!=',
    true
  );
  return querySearch;
};

export const predefinedFilter = (
  selectedListView: string,
  userName: string,
  url: string = ''
) => {
  let querySearch = '';
  const activeLeadsViews = ['activeFreshLead', 'myActiveFreshLead'];
  const databaseLeadsViews = ['activeDatabaseLead', 'myActiveDatabaseLead'];
  const retainerLeadsViews = ['activeRetainerLead', 'myActiveRetainerLead'];
  if (selectedListView === 'myLeads') {
    querySearch = transformUrlQuerySearch(
      url,
      {
        selectValue: 'assigned.name',
        inputValue: userName,
      },
      '='
    );
    querySearch = addNotPurchaseAndNotRejectedFilter(querySearch);
  } else if (selectedListView !== 'allLeads') {
    // Lead Type != Retainer
    if (
      retainerLeadsViews.includes(selectedListView) ||
      activeLeadsViews.includes(selectedListView)
    ) {
      querySearch = transformUrlQuerySearch(
        url,
        {
          selectValue: 'lead.type',
          inputValue: 'LEAD_TYPE_RETAINER',
        },
        retainerLeadsViews.includes(selectedListView) ? '=' : '!='
      );
    }

    querySearch = addNotPurchaseAndNotRejectedFilter(querySearch);

    // Lead Source Name not contain “Database” AND Lead Source Name not contain “Retainer”  AND
    if (databaseLeadsViews.includes(selectedListView)) {
      querySearch += transformUrlQueryMultiSelect(
        querySearch,
        sourceNotContainPredefinedFilter.map((source) => ({
          value: source.name,
        })),
        'lead.source'
      );
    }
    if (activeLeadsViews.includes(selectedListView)) {
      for (const source of sourceNotContainPredefinedFilter) {
        querySearch += transformUrlQuerySearch(
          querySearch,
          {
            selectValue: 'lead.source',
            inputValue: source.name,
          },
          '!='
        );
      }
    }
    // if myActiveFreshLead, add user filter
    if (
      [
        'myActiveFreshLead',
        'myActiveDatabaseLead',
        'myActiveRetainerLead',
      ].includes(selectedListView)
    ) {
      querySearch += transformUrlQuerySearch(
        querySearch,
        {
          selectValue: 'assigned.name',
          inputValue: userName,
        },
        '='
      );
    }
  }
  return querySearch;
};

export const activeFreshLeadUserRoles = [
  UserRoles.ADMIN_ROLE,
  UserRoles.SUPER_ADMIN_ROLE,
  UserRoles.SUPERVISOR_ROLE,
  UserRoles.MANAGER_ROLE,
];

export const isDatabaseTeam = (team: string) =>
  team.includes('database') && team.includes('non') && team.includes('motor');

export const predefinedFilterOptions = (
  selectedListView: string,
  currentUser: { role: string; team?: string },
  setSelectedListView: (view: string) => void,
  getString: (key: string) => string,
  SearchIcon: React.ReactNode,
  isPreDefinedFiltersHealthLeadEnabled: boolean
) => {
  if (!isPreDefinedFiltersHealthLeadEnabled) {
    if (currentUser.role !== 'roles/sales') {
      return [
        ...(selectedListView !== 'allLeads'
          ? [
              {
                id: 'all-lead',
                name: getString('healthLead.allLeads'),
                onClick: () => setSelectedListView('allLeads'),
                actionElem: SearchIcon,
              },
            ]
          : []),
        ...(selectedListView !== 'myLeads'
          ? [
              {
                id: 'my-lead',
                name: getString('healthLead.myLeads'),
                onClick: () => setSelectedListView('myLeads'),
                actionElem: SearchIcon,
              },
            ]
          : []),
      ];
    }
    return [
      {
        id: 'my-lead',
        name: getString('healthLead.myLeads'),
        onClick: () => setSelectedListView('myLeads'),
        actionElem: SearchIcon,
      },
    ];
  }
  const userFromTeamCannotSeeFilter = isDatabaseTeam(
    currentUser?.team?.toLowerCase() ?? ''
  );
  return [
    // All Leads option - show if not on allLeads view and user is not sales role
    ...(selectedListView !== 'allLeads' &&
    currentUser.role !== 'roles/sales' &&
    !userFromTeamCannotSeeFilter
      ? [
          {
            id: 'all-lead',
            name: getString('healthLead.allLeads'),
            onClick: () => setSelectedListView('allLeads'),
            actionElem: SearchIcon,
          },
        ]
      : []),
    // My Leads option - show if not on myLeads view
    ...(selectedListView === 'myLeads'
      ? []
      : [
          {
            id: 'my-lead',
            name: getString('healthLead.myLeads'),
            onClick: () => setSelectedListView('myLeads'),
            actionElem: SearchIcon,
          },
        ]),
    ...(selectedListView === 'activeFreshLead' ||
    !activeFreshLeadUserRoles.includes(
      currentUser.role as unknown as UserRoles
    ) ||
    userFromTeamCannotSeeFilter
      ? []
      : [
          {
            id: 'active-fresh-lead',
            name: getString('healthLead.activeFreshLead'),
            onClick: () => setSelectedListView('activeFreshLead'),
            actionElem: SearchIcon,
          },
        ]),
    ...(selectedListView === 'myActiveFreshLead' ||
    ![...activeFreshLeadUserRoles, UserRoles.SALE_ROLE].includes(
      currentUser.role as unknown as UserRoles
    ) ||
    userFromTeamCannotSeeFilter
      ? []
      : [
          {
            id: 'my-active-fresh-lead',
            name: getString('healthLead.myActiveFreshLead'),
            onClick: () => setSelectedListView('myActiveFreshLead'),
            actionElem: SearchIcon,
          },
        ]),
    ...(!activeFreshLeadUserRoles.includes(
      currentUser.role as unknown as UserRoles
    )
      ? []
      : [
          ...(selectedListView === 'activeDatabaseLead'
            ? []
            : [
                {
                  id: 'active-database-lead',
                  name: getString('healthLead.activeDatabaseLead'),
                  onClick: () => setSelectedListView('activeDatabaseLead'),
                  actionElem: SearchIcon,
                },
              ]),
          ...(selectedListView === 'activeRetainerLead'
            ? []
            : [
                {
                  id: 'active-retainer-lead',
                  name: getString('healthLead.activeRetainerLead'),
                  onClick: () => setSelectedListView('activeRetainerLead'),
                  actionElem: SearchIcon,
                },
              ]),
        ]),
    ...(![...activeFreshLeadUserRoles, UserRoles.SALE_ROLE].includes(
      currentUser.role as unknown as UserRoles
    )
      ? []
      : [
          ...(selectedListView === 'myActiveDatabaseLead'
            ? []
            : [
                {
                  id: 'my-active-database-lead',
                  name: getString('healthLead.myActiveDatabaseLead'),
                  onClick: () => setSelectedListView('myActiveDatabaseLead'),
                  actionElem: SearchIcon,
                },
              ]),
          ...(selectedListView === 'myActiveRetainerLead'
            ? []
            : [
                {
                  id: 'my-active-retainer-lead',
                  name: getString('healthLead.myActiveRetainerLead'),
                  onClick: () => setSelectedListView('myActiveRetainerLead'),
                  actionElem: SearchIcon,
                },
              ]),
        ]),
  ];
};
