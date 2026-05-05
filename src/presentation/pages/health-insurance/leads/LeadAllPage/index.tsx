import { Search } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { initialPageState } from 'data/slices/importSlices/helper';

import Checkbox from 'presentation/components/controls/Checkbox';
import {
  useGetTeamDetailQuery,
  useGetTeamMembersQuery,
} from 'data/slices/teamSlice';

import useTableList, { Column } from 'presentation/hooks/useTableList';
import { ActionButtonConfigs, columns } from './config';

import {
  CalendarIcon,
  FilterIcon,
  MoreVerticalIcon,
  SaveIcon,
  SettingsIcon,
} from '@alphafounders/icons';
import { Button, DropdownButton, FloatingButton } from '@alphafounders/ui';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import CommonModal from 'presentation/components/modal/CommonModal';
import { getString } from 'presentation/theme/localization';

import { getBornDateRangeByAge } from '@careos/utils';
import { appointmentAbleUser, UserRoles } from 'config/constant';
import { useLazyGetAllLeadsQuery } from 'data/slices/healthSlice';
import CustomModal from 'presentation/components/common/CustomModal';
import Select from 'presentation/components/controls/Select';
import { initialButtonState } from 'presentation/components/TableAllLead/leadTable.helper';
import {
  transformUrlQueryDateBetween,
  transformUrlQueryMultiSelect,
  transformUrlQueryNumberBetween,
  transformUrlQuerySearch,
  transformUrlQuerySearchTrueFalse,
} from 'presentation/pages/car-insurance/CarePay/Contracts/helper';
import { useNavigate } from 'react-router-dom';
import {
  defaultColumnsToShow,
  defaultModalState,
  predefinedFilter,
  predefinedFilterOptions,
  transformUrlRejectedLead,
} from './helper';
import LeadModals, { FilterModal } from './leadModals';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

function ActionComponent({
  rows,
  selected,
  isSelectedAll,
  setIsSelectAll,
  setSelected,
}: any) {
  return (
    <div className="flex flex-col">
      <span className="text-primary text-xs">({selected.length})</span>
      <Checkbox
        label=""
        color="primary"
        checked={isSelectedAll}
        onChange={(e: any) => {
          const isChecked = e.target.checked;

          setIsSelectAll(isChecked);
          if (isChecked) {
            setSelected(rows.map((row: any) => row.id));
          } else {
            setSelected([]);
          }
        }}
        id="data-checkbox-all"
      />
    </div>
  );
}

export default function AllLeadsPage({
  selectedListView,
  setSelectedListView,
  currentUser,
}: {
  setSelectedListView: (listView: string) => void;
  selectedListView: string;
  currentUser: { role: string; name: string };
}) {
  const navigate = useNavigate();
  const navigateBlank = (link: string) => window.open(link, '_blank');
  const featureFlags = useFlags([
    FeatureFlags.BROK_3805_PRE_DEFINED_FILTERS_HEALTHLEAD_20251107_TEMP,
  ]);
  const { data: member } = useGetTeamMembersQuery({
    filter: `user="${currentUser.name}"`,
  });
  const { data: teamDetail } = useGetTeamDetailQuery(
    `teams/${member?.name?.split('/')[1]}`,
    {
      skip: !member?.name,
    }
  );

  const isPreDefinedFiltersHealthLeadEnabled =
    featureFlags[
      FeatureFlags.BROK_3805_PRE_DEFINED_FILTERS_HEALTHLEAD_20251107_TEMP
    ]?.enabled ?? false;

  const defaultFilter = {
    ...initialPageState,
    showDeleted: selectedListView === 'allLeads',
    orderBy: 'lead.humanId desc',
    product: 'health-insurance',
    filter: predefinedFilter(selectedListView, currentUser.name),
  };
  const [fullTextSearchValue, setFullTextSearchValue] = useState('');
  const [currentFilter, setCurrentFilter] = useState(defaultFilter);
  const [previousSearch, setPreviousSearch] = useState<any>({
    search: [],
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedHumanIds, setSelectedHumanIds] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isSelectedAll, setIsSelectAll] = useState(false);
  const [modal, setModal] = useState<any>(defaultModalState);
  const [isOpen, setIsOpen] = useState(false);
  const [reset, setReset] = useState(false);

  const [_columns, setColumns] = useState<Column[]>(
    columns(defaultColumnsToShow, navigateBlank, selectedListView)
  );
  const [selectedSearch, setSelectedSearch] =
    useState<string>('insuree.fullName');
  const [buttonState, setButtonState] = useState(initialButtonState);

  const handleSelect = (id: string, data?: any) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((configId) => configId !== id)
        : [...selected, id]
    );

    setSelectedHumanIds(
      selected.includes(id)
        ? selected.filter((configId) => configId !== id)
        : [...selectedHumanIds, data.leadId]
    );

    setSelectedAgents(
      selected.includes(id)
        ? selectedAgents.filter(
            (assignmentResourceName) =>
              assignmentResourceName !== data.assignmentResourceName
          )
        : [...selectedAgents, data.assignmentResourceName]
    );
  };

  const { TableComponent, TopComponent, refetch, tableData, setColumnSetting } =
    useTableList(
      'all-leads',
      _columns,
      currentFilter,
      useLazyGetAllLeadsQuery,
      selected,
      handleSelect,
      [_columns, selected, isSelectedAll]
    );

  const handleModal = (data: any) => {
    const info = {
      type: '',
      label: '',
      title: '',
      show: false,
      size: 'xs',
      titleCenter: true,
      ...data,
    };

    if (data.type === 'assign') {
      info.title = `${getString('lead.assignment')}: ${selected.length} ${getString('text.leads')}`;
      info.size = 'sm';
    }

    if (data.type === 'underwriting') {
      info.selected = selectedHumanIds;
    }
    setModal({
      ...info,
    });
  };
  const handleCloseModal = () => handleModal(defaultModalState);

  const handleColSettings = (cols: Column[]) => {
    setColumns(cols);
    setColumnSetting(cols);
    handleCloseModal();
  };

  const handleOnClickAppointment = () => {
    setModal({
      title: 'Appointment',
      type: 'appointment',
      show: true,
      size: 'xs',
      titleCenter: true,
    });
  };

  const transformUrlConsent = (
    url: string,
    consent: { value: boolean }[],
    name: string
  ): string => {
    if (consent?.length === 1) {
      const agreement = consent[0]?.value ? '="agreements"' : '!="agreements"';
      return `${url ? `${url} ` : ''}lead.data.marketingConsent.${name}${agreement}`;
    }
    return url;
  };

  const handleSubmit = (value: any) => {
    setIsOpen(false);
    setPreviousSearch(value);

    let url = '';
    const {
      rejectedLead,
      showDeleted,
      leadStatus,
      leadType,
      agentName,
      callOnSundayAndHoliday,
      customerGender,
      customerLanguage,
      consentPersonalizedOffersAndCommunication,
      consentOffersFromOurBusinessPartners,
      consentDataAnalytics,
      policyHolderGender,
      beneficiaryGender,
      currentInsurer,
      preferredInsurer,
      preferredProductCategory,
      preferredProductType,
      deliveryOption,
      underwritingStatus,
      preferredPolicyStartDate,
      policyHolderAge,
      customerAge,
      isThaiNational,
      search,
      callAttempts,
    } = value;

    if (search) {
      url += transformUrlQuerySearch(url, search);
    }

    const multiSelect = [
      {
        name: 'lead.source',
        value: value?.leadSource,
      },
      {
        name: 'lead.status',
        value: leadStatus,
      },
      {
        name: 'lead.type',
        value: leadType,
      },
      {
        name: 'assigned.name',
        value: agentName,
      },
      {
        name: 'attributes.sundayContactable',
        value: callOnSundayAndHoliday,
      },
      {
        name: 'lead.data.customer.gender',
        value: customerGender,
      },
      {
        name: 'lead.data.policyHolder.locale',
        value: customerLanguage,
      },
      {
        name: 'lead.data.policyHolder.gender',
        value: policyHolderGender,
      },
      {
        name: 'lead.data.beneficiaries[].gender',
        value: beneficiaryGender,
      },
      {
        name: 'insurance.currentInsurerId',
        value: currentInsurer,
      },
      {
        name: 'insurance.preferredInsurerId',
        value: preferredInsurer,
      },
      {
        name: 'lead.data.insurance.category',
        value: preferredProductCategory,
      },
      {
        name: 'lead.data.insurance.type',
        value: preferredProductType,
      },
      {
        name: 'lead.data.checkout.deliveryOption',
        value: deliveryOption,
      },
      {
        name: 'attributes.underwritingStatus',
        value: underwritingStatus,
      },
    ];
    multiSelect.forEach(({ name, value: val }) => {
      if (val) url += transformUrlQueryMultiSelect(url, val, name);
    });

    const unAssignedFilter =
      url.includes('assigned.name') &&
      agentName.find((agent: any) => agent.id === 'Unassigned');
    if (unAssignedFilter) {
      url = url.replace(
        transformUrlQueryMultiSelect('', agentName, 'assigned.name'),
        'assigned not_exists'
      );
    }

    url = transformUrlConsent(
      url,
      consentPersonalizedOffersAndCommunication,
      'personalizedOffers'
    );

    url = transformUrlConsent(url, consentDataAnalytics, 'dataAnalytics');

    url = transformUrlRejectedLead(url, rejectedLead);

    url = transformUrlConsent(
      url,
      consentOffersFromOurBusinessPartners,
      'offerFromBusinessPartners'
    );

    const dateBetweens = [
      {
        name: value?.date?.startDate?.criteria,
        value: value?.date?.startDate?.range,
      },
      {
        name: value?.date?.endDate?.criteria,
        value: value?.date?.endDate?.range,
      },
      {
        name: 'insurance.policyStartDate',
        value: preferredPolicyStartDate,
      },
      ...(parseFloat(policyHolderAge)
        ? [
            {
              name: 'lead.data.policyHolder.dob',
              value: getBornDateRangeByAge(policyHolderAge),
            },
          ]
        : []),
      ...(parseFloat(customerAge)
        ? [
            {
              name: 'lead.data.customer.dob',
              value: getBornDateRangeByAge(customerAge),
            },
          ]
        : []),
    ];
    dateBetweens.forEach(({ name, value: val }) => {
      if (val) url += transformUrlQueryDateBetween(url, val, name);
    });

    url += predefinedFilter(selectedListView, currentUser.name, url);

    if ([true, false].includes(isThaiNational)) {
      url += transformUrlQuerySearchTrueFalse(
        url,
        {
          selectValue: 'lead.data.customer.isThaiNational',
          inputValue: isThaiNational,
        },
        '='
      );
    }

    if (callAttempts) {
      url += transformUrlQueryNumberBetween(
        url,
        callAttempts,
        'attributes.callAttempts'
      );
    }

    if (fullTextSearchValue) {
      url += transformUrlQuerySearch(
        url,
        {
          selectValue: selectedSearch,
          inputValue:
            selectedSearch === 'insuree.phone'
              ? formatPhoneNumber(fullTextSearchValue)
              : fullTextSearchValue,
        },
        selectedSearch === 'insuree.fullName' ? ':' : '='
      );
    }

    setCurrentFilter({
      ...currentFilter,
      filter: url,
      showDeleted: showDeleted ?? false,
    });

    handleCloseModal();
  };

  useEffect(() => {
    if (!tableData?.length) return;
    const itemsChecked = tableData.filter((lead: { id: string }) =>
      selected.includes(lead?.id as string)
    );
    let assign: string[] = [];
    let unassign: string[] = [];
    if (itemsChecked?.length) {
      assign = itemsChecked?.map((item: { id: string }) => item?.id || '');
      unassign = itemsChecked
        ?.filter((item: { assignedOn: string }) => item?.assignedOn !== '')
        ?.map(
          (item: { assignmentResourceName: string }) =>
            item?.assignmentResourceName || ''
        );
    }
    setButtonState([
      { assign: !!assign.length, ids: assign },
      { unassign: !!unassign.length, ids: unassign },
    ]);
  }, [tableData, selected]);

  const acionButtonsArr = ActionButtonConfigs({
    navigate,
    handleModal,
    data: {
      selected,
      buttonState,
    }, // need to pass data
    role: currentUser.role,
  }) as any;

  const formatPhoneNumber = (phone: string) =>
    phone.startsWith('0') ? `66${phone.slice(1)}` : phone.replace('+', '');

  return (
    <div data-testid="health-all-listing-page" className="h-auto min-h-full">
      <Helmet title="Health Insurance - All Listing Page" />
      <div className="bg-white mt-4">
        <div className="flex grow-0 basis-full flex-wrap mb-2 justify-between items-center p-2">
          <div className="w-60">
            <DropdownButton
              classes="w-[200px]"
              options={
                predefinedFilterOptions(
                  selectedListView,
                  {
                    ...currentUser,
                    team: teamDetail?.displayName,
                  },
                  setSelectedListView,
                  getString,
                  <Search color="primary" />,
                  isPreDefinedFiltersHealthLeadEnabled
                ) as any
              }
              text={`${getString(`healthLead.${selectedListView}`)}`}
            />
          </div>
          <div className="w-auto flex items-center justify-between gap-2">
            <div className="flex items-center">
              {appointmentAbleUser.includes(currentUser.role) && (
                <Button
                  text={getString('text.appointmentBtn')}
                  variant="secondary"
                  className="px-1 h-10 normal-case mr-1 border-[1px] border-[#b0c6e3] text-nowrap"
                  icon={<CalendarIcon className="calendar-icon mr-1" />}
                  onClick={handleOnClickAppointment}
                />
              )}
              <Select
                options={[
                  {
                    id: 'insuree.fullName',
                    name: 'insuree.fullName',
                    title: getString('carepay.contract.customerName'),
                    value: 'insuree.fullName',
                  },
                  {
                    id: 'lead.humanId',
                    name: 'lead.humanId',
                    title: getString('text.leadId'),
                    value: 'lead.humanId',
                  },
                  {
                    id: 'insuree.phone',
                    name: 'insuree.phone',
                    title: getString(`healthLead.policyHolderPhoneNumber`),
                    value: 'insuree.phone',
                  },
                  {
                    id: 'lead.data.policyHolder.nationalId',
                    name: 'lead.data.policyHolder.nationalId',
                    title: getString('healthLead.policyHolderNationalId'),
                    value: 'lead.data.policyHolder.nationalId',
                  },
                  {
                    id: 'lead.data.policyHolder.passport',
                    name: 'lead.data.policyHolder.passport',
                    title: getString(`healthLead.policyHolderPassport`),
                    value: 'lead.data.policyHolder.passport',
                  },
                ]}
                selectField="name"
                defaultValue="insuree.fullName"
                value={selectedSearch}
                onChange={(e) =>
                  setSelectedSearch(
                    (e.target as HTMLSelectElement).value.toString()
                  )
                }
                className="w-[160px]"
                data-testid="select-input-type"
              />
              <CommonTextField
                label=""
                placeholder={getString('text.search')}
                onChange={(e) => {
                  setCurrentFilter({
                    ...currentFilter,
                    filter:
                      predefinedFilter(selectedListView, currentUser.name) +
                      transformUrlQuerySearch(
                        currentFilter?.filter ?? '',
                        {
                          selectValue: selectedSearch,
                          inputValue:
                            selectedSearch === 'insuree.phone'
                              ? formatPhoneNumber(e.target.value)
                              : e.target.value,
                        },
                        selectedSearch === 'insuree.fullName' ? ':' : '='
                      ),
                  });
                  setFullTextSearchValue(e.target.value);
                }}
              />
              <div className="flex flex-wrap items-center ml-2 space-x-2">
                {acionButtonsArr.length > 0 && (
                  <DropdownButton
                    classes="w-[200px] mb-2"
                    options={acionButtonsArr}
                    text="Action"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end items-center">
              <FloatingButton
                className="!rounded h-[80px] !p-2 !bg-transparent !border !border-[#005098]"
                icon={<MoreVerticalIcon />}
                floatingButtons={[
                  {
                    icon: <SettingsIcon />,
                    position: '-top-4 -left-12',
                    onClick: () =>
                      handleModal({
                        title: getString('healthLead.settingTitle'),
                        type: 'settings',
                        show: true,
                        size: 'md',
                      }),
                  },
                  {
                    icon: <FilterIcon />,
                    position: '-top-8 left-0',
                    onClick: () => setIsOpen(true),
                  },
                  {
                    icon: <SaveIcon />,
                    position: '-top-4 left-12',
                    onClick: () =>
                      handleModal({
                        title: 'Save fields, filters, and sortings',
                        type: 'save',
                        show: true,
                      }),
                  },
                ]}
              />

              <TopComponent />
            </div>
          </div>
        </div>
        <div className="mt-1 relative z-0">
          <TableComponent
            ExpandableComponentParams={{
              role: currentUser.role,
              isAllSelectable: true,
            }}
            ActionCellElements={({ rows }) =>
              ActionComponent({
                rows,
                selected,
                setSelected,
                isSelectedAll,
                setIsSelectAll,
              })
            }
          />
        </div>
      </div>
      <CustomModal show={isOpen} onClose={() => setIsOpen(false)}>
        <FilterModal
          modalInfo={modal}
          handleModal={handleModal}
          handleSubmit={handleSubmit}
          initialValues={previousSearch}
          handleReset={() => {
            setReset(!reset);
            setCurrentFilter({
              ...defaultFilter,
              filter: predefinedFilter(selectedListView, currentUser.name),
            });
          }}
          reset={reset}
          role={currentUser.role}
        />
      </CustomModal>

      <CommonModal
        isShowCloseBtn
        maxWidth={modal.size}
        title={modal.title}
        titleCenter
        open={modal.show}
        handleCloseModal={handleCloseModal}
      >
        <LeadModals
          refetch={refetch}
          modalInfo={modal}
          handleModal={handleModal}
          handleColSettings={handleColSettings}
          // columns={_columns}
          columns={columns(
            defaultColumnsToShow.slice(1),
            navigateBlank,
            selectedListView
          )}
          handleSubmit={handleSubmit}
          initialValues={previousSearch}
          selectedAgents={selectedAgents}
        />
      </CommonModal>
    </div>
  );
}
