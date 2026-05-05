import { Card, CardContent, Grid } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SORT_TABLE_TYPE } from 'presentation/HOCs/WithTableListHelper';
import WithTableScrollHoc from 'presentation/HOCs/WithTableScroll';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getLeadAssignment } from 'presentation/redux/actions/leads/lead-assignment';
import { getLeadRejectParticipants } from 'presentation/redux/actions/leads/lead-reject-recording';
import { destroyPage } from 'presentation/redux/actions/page';
import { getCallId } from 'presentation/redux/epics/lead/helper';
import { getString } from 'presentation/theme/localization';
import { formatE164, isPossiblePhoneNumber } from 'shared/helper/utilities';
import { IPageState } from 'shared/interfaces/common/table';
import { SelectElement } from 'shared/types/controls';

import {
  changeSortStatus,
  DEFAULT_PER_PAGE_TABLE,
  getOrderLead,
  ITEM_PER_PAGE_LIST,
  RECORDING_ERROR_CODE,
  RECORDING_ERROR_MESSAGE,
  returnTableAllLeadSetting,
} from './TableAllLead.helper';
import TableAllLeadButton from './TableAllLeadButton';
import TableBlank from './TableAllLeadComponent/TableBlank';
import TableData from './TableAllLeadComponent/TableData';
import TableHeader from './TableAllLeadComponent/TableHeader';
import TableSkeleton from './TableAllLeadComponent/TableSkeleton';
import { voiceModalStyles } from './TableRejectionLead.helper';
import VoiceModal from './voiceModal';

import Pagination from '../controls/OldPagination';
import CommonModal from '../modal/CommonModal';
import { TableContainer } from '../table/TableStyledComponent';
import './TableAllLead.scss';

export enum IS_CHECKED {
  NONE = 'NONE',
  SOME_ITEMS = 'SOME_ITEMS',
  ALL = 'ALL',
}
interface IProps {
  tableRefContainer: React.Ref<HTMLDivElement>;
  tableType: TABLE_LEAD_TYPE;
  searchValue: any;
}

interface IData {
  [key: string]: string | number | boolean;
}

const initialButtonState: {
  assign?: boolean;
  unassign?: boolean;
  approve?: boolean | null;
  ids?: string[];
  rejections?: string[];
}[] = [
  { assign: false, ids: [] },
  { unassign: false, ids: [] },
  { approve: null, rejections: [] },
];
const DEFAULT_PRODUCT = 'car-insurance';

function TableAllLead({ tableRefContainer, tableType, searchValue }: IProps) {
  const policyExpiryDateQueryEnabled = false;

  const dispatch = useDispatch();
  const tableRef = useRef<HTMLDivElement>(null);
  const voiceModalClasses = voiceModalStyles();

  const [page] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PER_PAGE_TABLE);
  const [isAllChecked, setIsAllChecked] = useState<
    'NONE' | 'SOME_ITEMS' | 'ALL'
  >(IS_CHECKED.NONE);
  const [configTable, setConfigTable] = useState(
    returnTableAllLeadSetting(tableType)
  );
  const [leadData, setLeadData] = useState<any[]>([]);
  const [buttonState, setButtonState] = useState(initialButtonState);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pageStateSorting, setPageStateSorting] = useState<IPageState>({});

  const leadDataInState = useSelector(
    (state: any) => state?.leadsReducer?.leadAssignmentReducer?.data || []
  );
  const isLoading = useSelector(
    (state: any) => state?.leadsReducer?.leadAssignmentReducer?.isFetching
  );

  const totalItem = useSelector(
    (state: any) => state?.leadsReducer?.leadAssignmentReducer?.totalItem
  );

  const product = useSelector(
    (state: any) =>
      state?.typeSelectorReducer?.globalProductSelectorReducer?.data ||
      DEFAULT_PRODUCT
  );

  const leadParticipants = useSelector(
    (state: any) => state?.leadsReducer?.leadParticipantReducers || {}
  );

  const leadRecording = useSelector(
    (state: any) => state?.leadsReducer?.leadRecordingReducers || {}
  );

  const pageState = useSelector(
    (state: any) => state.leadsReducer.leadAssignmentReducer.pageState
  );

  useEffect(() => {
    setLeadData(leadDataInState);
    setIsAllChecked(IS_CHECKED.NONE);
  }, [leadDataInState]);

  // INFO: * Start Logic belong to Lead Assignment
  const changeIsAllCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    if (checked) {
      setIsAllChecked(IS_CHECKED.ALL);
    } else {
      setIsAllChecked(IS_CHECKED.NONE);
    }
  };

  useEffect(() => {
    const itemsChecked = leadData?.filter((item) => item.isChecked);
    let assign: string[] = [];
    let unassign: string[] = [];
    let rejections: string[] = [];
    if (itemsChecked?.length) {
      if (tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT) {
        assign = itemsChecked?.map(
          (item) => `leads/${item.leadDetailId || ''}`
        );
        unassign = itemsChecked
          ?.filter((item) => item.assignedOn !== '')
          ?.map((item) => item?.assignmentResourceName || '');
        setButtonState([
          { assign: !!assign.length, ids: assign },
          { unassign: !!unassign.length, ids: unassign },
        ]);
      }
      if (tableType === TABLE_LEAD_TYPE.LEAD_REJECTION) {
        rejections = itemsChecked.map((item) => item.rejectionId);

        setButtonState([
          { assign: false, ids: [] },
          { unassign: false, ids: [] },
          { approve: null, rejections },
        ]);
      }
    } else {
      setButtonState(initialButtonState);
    }
  }, [leadData]);

  useEffect(() => {
    let tempData = [...leadData];
    if (isAllChecked === IS_CHECKED.ALL) {
      tempData = tempData.map((item) => ({
        ...item,
        isChecked: true,
      }));
    }
    if (isAllChecked === IS_CHECKED.NONE) {
      tempData = tempData.map((item) => ({
        ...item,
        isChecked: false,
      }));
    }
    setLeadData(tempData);
  }, [isAllChecked]);

  const changeCheckedItem = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: IData
  ) => {
    let newListData = [...leadData];
    let passedItem = { ...item };
    newListData = newListData.map((lead) => {
      const newItem = { ...lead };
      if (newItem.id === item.id) {
        newItem.isChecked = !item.isChecked;
        passedItem = { ...newItem };
      }
      return newItem;
    });
    const { checked } = event.target;
    if (checked) {
      setIsAllChecked(IS_CHECKED.SOME_ITEMS);
    }

    const countItems = newListData.filter((lead) => lead.isChecked);
    if (countItems.length) {
      if (countItems.length === newListData.length) {
        setIsAllChecked(IS_CHECKED.ALL);
      } else {
        setIsAllChecked(IS_CHECKED.SOME_ITEMS);
      }
    } else {
      setIsAllChecked(IS_CHECKED.NONE);
    }
    setLeadData(newListData);
  };
  // INFO: * End Of Logic Lead Assignment

  const findSortColumn = (newColumns: any[], columnId: string) => {
    const findColumnSort = newColumns.find((item) => item.id === columnId);
    const newPageState: IPageState = {
      ...pageState,
      currentPage: 1,
      orderBy: getOrderLead(
        findColumnSort.sortingField,
        findColumnSort?.sorting as SORT_TABLE_TYPE
      ),
    };

    const search = { ...searchValue.search };
    const newSearchValue = {
      ...searchValue,
      date: {
        ...searchValue.date.startDate,
      },
      date2: {
        ...searchValue.date.endDate,
      },
      search: {
        [search.key]: search.value,
      },
    };

    dispatch(
      getLeadAssignment({
        ...newSearchValue,
        ...newPageState,
        tableType,
        policyDateEnabled: policyExpiryDateQueryEnabled,
      })
    );
    setPageStateSorting({ orderBy: newPageState?.orderBy });
  };

  const sortColumn = (columnId: string) => {
    let newColumns = [...configTable];
    newColumns = newColumns.map((item) => ({
      ...item,
      sorting:
        item.id === columnId
          ? changeSortStatus(item.sorting as SORT_TABLE_TYPE)
          : SORT_TABLE_TYPE.NONE,
    }));
    findSortColumn(newColumns, columnId);
    setConfigTable(newColumns);
  };

  const handlePerPageChange = (itemsPerPage: number) => {
    setRowsPerPage(itemsPerPage);
    const newPageState = {
      ...pageState,
      pageSize: itemsPerPage,
      currentPage: 1,
    };

    let search = { ...searchValue.search };
    if (search?.key === 'customerPhone') {
      search = {
        ...search,
        value: isPossiblePhoneNumber(search.value)
          ? formatE164(search.value)
          : search.value,
      };
    }

    const newSearchValue = {
      ...searchValue,
      date: {
        ...searchValue.date.startDate,
      },
      date2: {
        ...searchValue.date.endDate,
      },
      search: {
        [search.key]: search.value,
      },
    };

    dispatch(
      getLeadAssignment({
        ...newSearchValue,
        ...newPageState,
        ...pageStateSorting,
        tableType,
        policyDateEnabled: policyExpiryDateQueryEnabled,
      })
    );
  };

  const handlePageChange = (pageIdx: number) => {
    const newPageState = {
      ...pageState,
      currentPage: pageIdx,
    };

    let search = { ...searchValue.search };
    if (search?.key === 'customerPhone') {
      search = {
        ...search,
        value: isPossiblePhoneNumber(search.value)
          ? formatE164(search.value)
          : search.value,
      };
    }

    const newSearchValue = {
      ...searchValue,
      date: {
        ...searchValue.date.startDate,
      },
      date2: {
        ...searchValue.date.endDate,
      },
      search: {
        [search.key]: search.value,
      },
    };

    dispatch(
      getLeadAssignment({
        ...newSearchValue,
        ...newPageState,
        ...pageStateSorting,
        tableType,
        policyDateEnabled: policyExpiryDateQueryEnabled,
      })
    );
  };

  useEffect(
    () => () => {
      dispatch(destroyPage());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const body = {
      ...searchValue,
      ...pageStateSorting,
      tableType,
      policyDateEnabled: policyExpiryDateQueryEnabled,
    };
    // TODO: refactored this by creating getDefaultSorting() function
    if (tableType === TABLE_LEAD_TYPE.LEAD_ALL) {
      body.orderBy = getOrderLead('lead.createTime', SORT_TABLE_TYPE.DESC);
    }
    if (tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT) {
      body.orderBy = getOrderLead('lead.name', SORT_TABLE_TYPE.ASC);
    }
    if (tableType === TABLE_LEAD_TYPE.LEAD_REJECTION) {
      body.orderBy = getOrderLead(
        'attributes.undecidedRejectionCreateTime',
        SORT_TABLE_TYPE.ASC
      );
    }
    dispatch(getLeadAssignment(body));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const callApiAgainHandle = () => {
    const newValue = {
      ...searchValue,
      date: {
        ...searchValue.date.startDate,
      },
      date2: {
        ...searchValue.date.endDate,
      },
      search: {
        [searchValue.search.key]: searchValue.search.value,
      },
    };
    dispatch(
      getLeadAssignment({
        ...pageState,
        ...pageStateSorting,
        ...newValue,
        tableType,
      })
    );
  };

  const voiceModal = useMemo(() => {
    const isFetchingApis =
      leadParticipants?.isFetching || leadRecording?.isFetching;
    const isCallInProgress =
      leadRecording?.data?.error === RECORDING_ERROR_CODE &&
      leadRecording?.data?.message === RECORDING_ERROR_MESSAGE;
    const isRecordAvailable =
      leadParticipants?.data?.participants?.length &&
      leadRecording?.data?.error !== RECORDING_ERROR_CODE &&
      !leadParticipants?.isFetching &&
      !leadRecording?.isFetching;

    if (isFetchingApis) {
      return (
        <Grid className={voiceModalClasses.voiceModalMessage}>
          <div className="lds-dual-container">
            <div className="lds-dual-ring" />
          </div>
        </Grid>
      );
    }

    if (isCallInProgress) {
      return (
        <Grid className={voiceModalClasses.voiceModalMessage}>
          {getString('text.callInProgressMessage')}
        </Grid>
      );
    }

    if (isRecordAvailable) {
      const callId = getCallId(leadParticipants?.data?.participants[0]?.name);
      return <VoiceModal callId={callId} />;
    }
    return (
      <Grid className={voiceModalClasses.voiceModalMessage}>
        {getString('text.callErrorMessage')}
      </Grid>
    );
  }, [leadParticipants, leadRecording, voiceModalClasses.voiceModalMessage]);

  const handleVoiceModal = (value: string) => {
    // INFO: test lead id happy case leads/0546f61c-4233-419b-8604-c3970c6da821 , on going case: leads/358f7148-6e2c-483f-9352-e8a0665dae5e
    const leadId = value ? `leads/${value}` : '';
    if (leadId) {
      dispatch(
        getLeadRejectParticipants({
          pageSize: 1,
          filter: value ? `destination.lead.lead="${leadId}"` : '',
        })
      );
    }

    setShowConfirmModal(true);
  };

  const localeLeadData = leadData.map((data: any) => ({
    ...data,
    leadType: getString(data.leadType || ''),
    leadStatus: getString(data.leadStatus || ''),
    rejectionReason: getString(data.rejectionReason),
  }));

  return (
    <Grid
      item
      xs={12}
      lg={12}
      className="table-all-lead"
      ref={tableRef}
      data-testid="lead-table"
    >
      <Card>
        <CardContent>
          <Grid item xs={12} lg={12} className="all-leads-buttons">
            <TableAllLeadButton
              isAssign={tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT}
              isReject={tableType === TABLE_LEAD_TYPE.LEAD_REJECTION}
              buttonState={buttonState}
              callApiAgain={callApiAgainHandle}
            >
              <Pagination
                totalItem={totalItem}
                pageSize={rowsPerPage}
                page={pageState.currentPage}
                changePage={handlePageChange}
                options={ITEM_PER_PAGE_LIST}
                changePerPage={(event: React.ChangeEvent<SelectElement>) =>
                  handlePerPageChange(Number(event.target.value))
                }
              />
            </TableAllLeadButton>
            <TableContainer className="table-scrollbar" ref={tableRefContainer}>
              <Table stickyHeader aria-label="sticky table">
                <TableHeader
                  tableType={tableType}
                  configTable={configTable}
                  isAllChecked={isAllChecked}
                  setIsAllChecked={setIsAllChecked}
                  changeIsAllCheck={changeIsAllCheck}
                  sortColumn={sortColumn}
                />
                {isLoading ? (
                  <TableSkeleton
                    configTable={configTable}
                    pageState={pageState}
                    tableType={tableType}
                    page={page}
                    rowsPerPage={rowsPerPage}
                  />
                ) : (
                  <TableBody>
                    {leadData.length ? (
                      <TableData
                        configTable={configTable}
                        leadData={localeLeadData}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        tableType={tableType}
                        changeCheckedItem={changeCheckedItem}
                        handleVoiceModal={handleVoiceModal}
                      />
                    ) : (
                      <TableBlank configTable={configTable} />
                    )}
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Grid>
          <Grid container item xs={12} lg={12}>
            <Grid item xs={12} md={6} lg={6} className="dp-flex" />
            <Grid item xs={12} md={12} lg={12} className="footer-pagination">
              <Pagination
                totalItem={totalItem}
                pageSize={rowsPerPage}
                page={pageState.currentPage}
                changePage={handlePageChange}
                options={ITEM_PER_PAGE_LIST}
                addClass="custom-pagination"
                changePerPage={(event: React.ChangeEvent<SelectElement>) =>
                  handlePerPageChange(Number(event.target.value))
                }
              />
            </Grid>
            {tableType === TABLE_LEAD_TYPE.LEAD_REJECTION ? (
              <CommonModal
                title={getString('text.voiceFile')}
                open={showConfirmModal}
                handleCloseModal={() => {
                  setShowConfirmModal(false);
                }}
                wrapperClass={voiceModalClasses.voiceModalDialog}
              >
                {voiceModal}
              </CommonModal>
            ) : null}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default WithTableScrollHoc(TableAllLead);
