import { Card, CardContent, Grid } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useLazySearchLeadQuery } from 'data/slices/leadSearchSlice';
import { SORT_TABLE_TYPE } from 'presentation/HOCs/WithTableListHelper';
import WithTableScrollHoc from 'presentation/HOCs/WithTableScroll';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getLeadRejectParticipants } from 'presentation/redux/actions/leads/lead-reject-recording';
import { getCallId } from 'presentation/redux/epics/lead/helper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';
import { SelectElement } from 'shared/types/controls';
import {
  getLeadSearchFilterQueryString,
  getSortQueryString,
  PageState,
  transformPageStateToQuery,
} from 'utils/leadSearchUtils';
import useSnackbar from 'utils/snackbar';

import {
  getInitialPageState,
  initialButtonState,
  IS_CHECKED,
  TableRowData,
} from './leadTable.helper';
import {
  changeSortStatus,
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

interface LeadTableProps {
  tableRefContainer: React.Ref<HTMLDivElement>;
  tableType: TABLE_LEAD_TYPE;
  searchValue: any;
}

const DEFAULT_PRODUCT = 'car-insurance';

function TableAllLead({
  tableRefContainer,
  tableType,
  searchValue,
}: Readonly<LeadTableProps>) {
  const currentUser = useGetUserSelector();

  const policyExpiryDateQueryEnabled = false;

  const voiceModalClasses = voiceModalStyles();

  const dispatch = useDispatch();

  const product = useAppSelector(
    (state) =>
      (state?.typeSelectorReducer?.globalProductSelectorReducer?.data ||
        DEFAULT_PRODUCT) as string
  );

  const leadParticipants = useAppSelector(
    (state) => state?.leadsReducer?.leadParticipantReducers ?? {}
  );

  const leadRecording = useAppSelector(
    (state) => state?.leadsReducer?.leadRecordingReducers ?? {}
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pageState, setPageState] = useState<PageState>(
    getInitialPageState(tableType, product)
  );
  const [tableConfig, setTableConfig] = useState(
    returnTableAllLeadSetting(tableType, product)
  );
  const [checkedLead, setcheckedLead] = useState<string[]>([]);
  const [isAllChecked, setIsAllChecked] = useState<
    'NONE' | 'SOME_ITEMS' | 'ALL'
  >(IS_CHECKED.NONE);
  const [buttonState, setButtonState] = useState(initialButtonState);

  const [getLeads, { data: apiData, isLoading }] = useLazySearchLeadQuery();

  const { showErrorSnackbar } = useSnackbar();

  useEffect(() => {
    if (apiData) {
      setcheckedLead([]);
    }
  }, [apiData]);

  // TODO: refactor to not use a state for this
  useEffect(() => {
    const itemsChecked = apiData?.leads?.filter((lead) =>
      checkedLead.includes(lead?.leadDetailId as string)
    );
    let assign: string[] = [];
    let unassign: string[] = [];
    let rejections: string[] = [];
    if (itemsChecked?.length) {
      if (tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT) {
        assign = itemsChecked?.map(
          (item) => `leads/${item?.leadDetailId || ''}`
        );
        unassign = itemsChecked
          ?.filter((item) => item?.assignedOn !== '')
          ?.map((item) => item?.assignmentResourceName || '');
        setButtonState([
          { assign: !!assign.length, ids: assign },
          { unassign: !!unassign.length, ids: unassign },
        ]);
      }
      if (tableType === TABLE_LEAD_TYPE.LEAD_REJECTION) {
        rejections = itemsChecked.map((item) => item?.rejectionId as string);
        const statuses = itemsChecked.map((item) => ({
          status: item?.leadStatus as string,
          id: item?.rejectionId as string,
        }));

        setButtonState([
          { assign: false, ids: [] },
          { unassign: false, ids: [] },
          { approve: null, rejections, statuses },
        ]);
      }
    } else {
      setButtonState(initialButtonState);
    }
  }, [apiData?.leads, checkedLead, tableType]);

  const localeLeadData = useMemo(
    () =>
      (apiData?.leads ?? []).map((lead) => ({
        ...lead,
        leadType: getString(lead?.leadType ?? ''),
        leadStatus: getString(lead?.leadStatus ?? ''),
        rejectionReason: getString(lead?.rejectionReason ?? ''),
        isChecked: checkedLead.includes(lead?.leadDetailId as string),
      })),
    [apiData?.leads, checkedLead]
  );

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

  const callApi = async (_pageState: PageState, _searchValue: any) => {
    const response = await getLeads({
      product: product.split('/')[1],
      filter: getLeadSearchFilterQueryString({
        tableType,
        policyDateEnabled: policyExpiryDateQueryEnabled,
        filters: _searchValue,
      }),
      ...transformPageStateToQuery(_pageState),
      withRejectionComment: tableType === TABLE_LEAD_TYPE.LEAD_REJECTION,
      currentUser,
    });

    if (response.isError) {
      showErrorSnackbar(getString('text.error'));
    }
  };

  const sortColumn = (columnId: string) => {
    const newTableConfig = tableConfig.map((item) => ({
      ...item,
      sorting:
        item.id === columnId
          ? changeSortStatus(item.sorting as SORT_TABLE_TYPE)
          : SORT_TABLE_TYPE.NONE,
    }));
    const sortTarget = newTableConfig.find((column) => column.id === columnId);
    setTableConfig(newTableConfig);
    setPageState((prev) => ({
      ...prev,
      currentPage: 1,
      orderBy: getSortQueryString(
        sortTarget?.sortingField as string,
        sortTarget?.sorting as SORT_TABLE_TYPE
      ),
    }));
  };

  const handlePerPageChange = (itemsPerPage: number) => {
    setPageState((prev) => ({
      ...prev,
      currentPage: 1,
      pageSize: itemsPerPage,
    }));
  };

  const handlePageChange = (pageIdx: number) => {
    setPageState((prev) => ({ ...prev, currentPage: pageIdx }));
  };

  const changeIsAllCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const someItemsChecked = (apiData?.leads ?? []).some(
      (lead) => lead.optOutCalls
    );
    if (someItemsChecked && checked) {
      setIsAllChecked(IS_CHECKED.SOME_ITEMS);
      setcheckedLead(
        (apiData?.leads ?? [])
          .filter((lead) => !lead.optOutCalls)
          .map((lead) => lead?.leadDetailId)
      );
    } else if (checked) {
      setIsAllChecked(IS_CHECKED.ALL);
      setcheckedLead((apiData?.leads ?? []).map((lead) => lead?.leadDetailId));
    } else {
      setIsAllChecked(IS_CHECKED.NONE);
      setcheckedLead([]);
    }
  };

  const changeCheckedItem = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: TableRowData
  ) => {
    let updatedCheckLeadCount;
    if (checkedLead.includes(item.leadDetailId as string)) {
      const updatedCheckLead = checkedLead.filter(
        (name) => name !== item.leadDetailId
      );
      updatedCheckLeadCount = updatedCheckLead.length;
      setcheckedLead(updatedCheckLead);
    } else {
      const updatedCheckLead = [...checkedLead, item.leadDetailId as string];
      updatedCheckLeadCount = updatedCheckLead.length;
      setcheckedLead(updatedCheckLead);
    }

    if (updatedCheckLeadCount === localeLeadData.length) {
      setIsAllChecked(IS_CHECKED.ALL);
    } else if (updatedCheckLeadCount === 0) {
      setIsAllChecked(IS_CHECKED.NONE);
    } else {
      setIsAllChecked(IS_CHECKED.SOME_ITEMS);
    }
  };

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

  useEffect(() => {
    callApi(pageState, searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState]);

  useEffect(() => {
    const initialPageState = getInitialPageState(tableType, product);
    callApi(initialPageState, searchValue);
    setPageState(initialPageState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, tableType]);

  return (
    <Grid
      item
      xs={12}
      lg={12}
      className="table-all-lead"
      data-testid="lead-table"
    >
      <Card>
        <CardContent>
          <Grid item xs={12} lg={12} className="all-leads-buttons">
            <TableAllLeadButton
              isAssign={tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT}
              isReject={tableType === TABLE_LEAD_TYPE.LEAD_REJECTION}
              buttonState={buttonState}
              callApiAgain={() => callApi(pageState, searchValue)}
            >
              <Pagination
                totalItem={apiData?.total ?? 0}
                pageSize={pageState.pageSize}
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
                  configTable={tableConfig}
                  isAllChecked={isAllChecked}
                  setIsAllChecked={setIsAllChecked}
                  changeIsAllCheck={changeIsAllCheck}
                  sortColumn={sortColumn}
                />
                {isLoading ? (
                  <TableSkeleton
                    configTable={tableConfig}
                    pageState={pageState}
                    tableType={tableType}
                    page={0}
                    rowsPerPage={pageState.pageSize}
                  />
                ) : (
                  <TableBody data-testid="table-body">
                    {localeLeadData.length ? (
                      <TableData
                        configTable={tableConfig}
                        leadData={localeLeadData}
                        page={0}
                        rowsPerPage={pageState.pageSize}
                        tableType={tableType}
                        changeCheckedItem={changeCheckedItem}
                        handleVoiceModal={handleVoiceModal}
                      />
                    ) : (
                      <TableBlank configTable={tableConfig} />
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
                totalItem={apiData?.total ?? 0}
                pageSize={pageState.pageSize}
                page={pageState.currentPage}
                changePage={handlePageChange}
                options={ITEM_PER_PAGE_LIST}
                addClass="custom-pagination"
                changePerPage={(event: React.ChangeEvent<SelectElement>) =>
                  handlePerPageChange(Number(event.target.value))
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {tableType === TABLE_LEAD_TYPE.LEAD_REJECTION ? (
        <CommonModal
          title={getString('text.voiceFile')}
          open={showConfirmModal}
          handleCloseModal={() => {
            setShowConfirmModal(false);
          }}
          wrapperClass={voiceModalClasses.voiceModalDialog}
          data-testid="voice-modal"
        >
          {voiceModal}
        </CommonModal>
      ) : null}
    </Grid>
  );
}

export default WithTableScrollHoc(TableAllLead);
