import { DownloadFileIcon, PlayIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import {
  useMediaQuery,
  useTheme,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  makeStyles,
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { useFlags } from 'flagsmith/react';
import React, { memo, useState, useMemo, useEffect } from 'react';
import FeatureFlags from 'config/flagsmithConfig';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useGetCommunicationHistoryQuery } from 'data/slices/leadDetails/communicationSlice/communicationSlice';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import {
  AdminSupervisorRoles,
  displayDuration,
  displayTo,
  displayTimestamp,
  displayType,
  downloadFile,
  ICommunication,
} from './helper';
import { CommunicationType } from './index.model';

import CustomPagination from '../../../controls/CustomPagination';
import Spinner from '../../../Spinner';
import { voiceModalStyles } from '../../../TableAllLead/TableRejectionLead.helper';
import VoiceModal from '../../../TableAllLead/voiceModal';
import CommonModal from '../../CommonModal';
import {
  FIRST_PAGE,
  INITIAL_ITEM_PER_PAGE,
  ITEM_PER_PAGE_LIST,
  listToken,
  prevPageHandle,
} from '../activityTable/activityTable.helper';

import './index.scss';
import { Livetranscribe } from 'presentation/components/icons';
import TranscribeComponent from './TranscribeComponent';

export const useStylesCommunication = makeStyles((theme: any) => ({
  tHead: {
    background: theme.palette.info.main,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h6.fontSize,
    fontFamily: theme.typography.fontFamily,
  },
  tRow: {
    '&:nth-child(even)': {
      background: '#e6edf6',
    },
    '&:nth-child(odd)': {
      background: theme.palette.common.white,
    },
  },
  status: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeightMedium,
    width: 'fit-content',
    minHeight: '20px',
    textTransform: 'none',
    display: 'block',
    borderRadius: '4px',
    padding: '2px 10px 2px 10px',
  },
  tableContainer: {
    position: 'relative',
    paddingBottom: '50px',
    // marginTop: '20px',
  },
  pagination: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));
function CommunicationTable({
  id,
  downlaodAllRecordings,
  handleFinishDownload,
}: Readonly<{
  id?: string;
  downlaodAllRecordings?: boolean;
  handleFinishDownload?: () => void;
}>) {
  const flags = useFlags([FeatureFlags.BROK_510_AI_TRANSCRIBES_20241022_TEMP]);

  const { data: communicationHistory, isLoading: communicationHistoryLoading } =
    useGetCommunicationHistoryQuery(
      {
        leadId: id,
      },
      {
        skip: id == null,
        refetchOnMountOrArgChange: true,
      }
    );

  const [openTranscriptIds, setOpenTranscriptIds] = useState<string[]>([]);

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const { data: user, isLoading: isUserLoading } = useGetAuthenticateQuery();

  const ableToSeeDownload =
    !isUserLoading && AdminSupervisorRoles.includes(user?.role as UserRoleID);

  const showAiButton =
    (flags[FeatureFlags.BROK_510_AI_TRANSCRIBES_20241022_TEMP]?.enabled &&
      AdminSupervisorRoles.includes(user?.role as UserRoleID)) ??
    false;

  const [pageState, setPageState] = React.useState({
    currentPage: 1,
    pageSize: 10,
    pageToken: '1',
  });
  const [perPage, setPerPage] = useState<number>(INITIAL_ITEM_PER_PAGE);
  const classes = useStylesCommunication();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [callId, setCallId] = useState('');
  const voiceModalClasses = voiceModalStyles();
  const { breakpoints } = useTheme();

  const flexibleWidth = useMediaQuery(breakpoints.up('lg'));

  const clickHandle = (callName: string) => {
    setShowConfirmModal(true);
    setCallId(`calls/${callName.split('/')[1]}`);
  };

  const downloadClickHandle = async (callName: string) => {
    const result = await downloadFile(
      `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/${callName}/recording`
    );
    if (result) {
      showSuccessSnackbar(getString('text.successfullyDownloadAudio'));
      return;
    }
    showErrorSnackbar(getString('text.unableToDownloadAudio'));
  };

  const displayVoice = (row: ICommunication) => {
    if (
      row.communicationType === CommunicationType.CALL &&
      row.duration !== null
    ) {
      return (
        <Button
          text=""
          icon={<PlayIcon />}
          className="button-action p-1 rounded-[50px]"
          onClick={() => clickHandle(row.name)}
          data-testid="voice-play-button"
        />
      );
    }
    return <span>-</span>;
  };

  const displayDownload = (row: ICommunication) => {
    if (
      row.communicationType === CommunicationType.CALL &&
      row.duration !== null &&
      ableToSeeDownload
    ) {
      return (
        <Button
          text=""
          icon={<DownloadFileIcon fillColor="white" fontSize="small" />}
          className="button-action p-2 rounded-[50px]"
          onClick={() => downloadClickHandle(`calls/${row.name.split('/')[1]}`)}
          dataTestId="voice-download-button"
        />
      );
    }
    return <span>-</span>;
  };

  const displayTranscript = (row: ICommunication) => {
    if (
      row.communicationType === CommunicationType.CALL &&
      row.duration !== null &&
      ableToSeeDownload
    ) {
      return (
        <Button
          text=""
          icon={Livetranscribe as any}
          iconType="img"
          className="button-action p-[3px] rounded-[50px]"
          onClick={() =>
            setOpenTranscriptIds(
              !openTranscriptIds.includes(row.name)
                ? [...openTranscriptIds, row.name]
                : openTranscriptIds.filter((id) => id !== row.name)
            )
          }
          dataTestId="voice-download-button"
        />
      );
    }
    return <span>-</span>;
  };

  const columns = [
    {
      field: 'id',
      headerName: getString('text.noDots'),
      flex: flexibleWidth ? 1 : undefined,
      width: 100,
      disableClickEventBubbling: true,
    },
    {
      field: 'createTime',
      headerName: getString('text.date'),
      flex: flexibleWidth ? 2.5 : undefined,
      width: 250,
      valueFormatter: ({ createTime }: any) =>
        displayTimestamp({ value: createTime }),
      disableClickEventBubbling: true,
    },
    {
      field: 'createBy',
      headerName: getString('text.name'),
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      disableClickEventBubbling: true,
    },
    {
      field: 'communicationType',
      headerName: getString('text.type'),
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: displayType,
      disableClickEventBubbling: true,
    },
    {
      field: 'to',
      headerName: getString('text.to'),
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      valueFormatter: displayTo,
      align: 'center',
      headerAlign: 'center',
      disableClickEventBubbling: true,
    },
    {
      field: 'duration',
      headerName: getString('text.callDuration'),
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      valueFormatter: displayDuration,
      align: 'center',
      headerAlign: 'center',
      disableClickEventBubbling: true,
    },
    {
      field: '',
      headerName: getString('text.voiceFile'),
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      renderCell: displayVoice,
      align: 'center',
      headerAlign: 'center',
      renderJSX: true,
    },
    {
      field: '',
      headerName: getString('text.downloadFile'),
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      renderCell: displayDownload,
      align: 'center',
      headerAlign: 'center',
      renderJSX: true,
    },
  ];

  if (showAiButton) {
    columns.push({
      field: '',
      headerName: 'Care AI',
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      renderCell: displayTranscript,
      align: 'center',
      headerAlign: 'center',
      renderJSX: true,
    });
  }

  const rowsData = useMemo(() => {
    const from = (pageState.currentPage - 1) * pageState.pageSize;
    const to = pageState.currentPage * pageState.pageSize;
    return (communicationHistory || []).slice(from, to);
  }, [communicationHistory, pageState]);

  const handlePageChange = (
    page: number,
    tokenPage: string | null,
    isPrev?: boolean
  ) => {
    const newPageState = {
      ...pageState,
      currentPage: page,
    };
    if (isPrev) {
      const pageToken = prevPageHandle(listToken, page);
      if (pageToken) {
        newPageState.pageToken = pageToken.token;
      }
    }

    if (page === FIRST_PAGE) {
      newPageState.pageToken = '1';
    }
    setPageState(newPageState);
  };

  const handlePerPageChange = (itemsPerPage: number) => {
    setPerPage(itemsPerPage);
    const newPageState = {
      ...pageState,
      pageSize: itemsPerPage,
      pageToken: '2',
      currentPage: 1,
    };
    setPageState(newPageState);
  };

  const voiceModal = useMemo(() => {
    if (!callId) {
      return (
        <Grid className={voiceModalClasses.voiceModalMessage}>
          <div className="lds-dual-container">
            <div className="lds-dual-ring" />
          </div>
        </Grid>
      );
    }
    if (callId) {
      return <VoiceModal callId={callId} />;
    }
    return (
      <Grid className={voiceModalClasses.voiceModalMessage}>
        {getString('text.callErrorMessage')}
      </Grid>
    );
  }, [voiceModalClasses.voiceModalMessage, callId]);

  useEffect(() => {
    if (downlaodAllRecordings && rowsData.length > 0) {
      Promise.allSettled(
        rowsData
          .filter((row) => row.communicationType === CommunicationType.CALL)
          .map(async ({ name }) => {
            await downloadFile(
              `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/${name}/recording`
            );
          })
      )
        .then(() => {
          if (handleFinishDownload) handleFinishDownload();
        })
        .catch((err) => {
          console.log(err);
          showErrorSnackbar(getString('text.unableToDownloadAudio'));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downlaodAllRecordings, rowsData]);

  return (
    <Grid
      item
      container
      xs={12}
      md={12}
      data-testid="communication-table"
      className="communication-table"
    >
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow data-testid="communication-table-headerName">
              {columns.map((item) => (
                <TableCell
                  width={item.width}
                  key={item.headerName}
                  className={classes.tHead}
                  data-testid={`communication-table-headerName-${item.headerName}`}
                >
                  {item.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {communicationHistoryLoading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <Spinner />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : rowsData.length ? (
            rowsData.map((item: any) => (
              <>
                <TableRow key={item.id} className={classes.tRow}>
                  {columns.map((column: any) =>
                    column.renderJSX ? (
                      <TableCell>
                        {column.renderCell.bind(null, item)()}
                      </TableCell>
                    ) : column.valueFormatter ? (
                      <TableCell>
                        {column.valueFormatter.bind(null, item)()}
                      </TableCell>
                    ) : (
                      <TableCell>{item[column.field]}</TableCell>
                    )
                  )}
                </TableRow>
                {openTranscriptIds.includes(item.name) && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <TranscribeComponent
                        callId={item?.name?.split('/')?.[1]}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          ) : (
            <TableRow className={classes.tRow}>
              <TableCell align="center" colSpan={columns.length + 1}>
                {getString('text.noData')}
              </TableCell>
            </TableRow>
          )}
        </Table>
      </TableContainer>
      <div className={classes.pagination}>
        {communicationHistory?.length ? (
          <CustomPagination
            page={pageState.currentPage}
            perPage={perPage}
            pageSizes={ITEM_PER_PAGE_LIST}
            nextToken={pageState.pageToken}
            onChangePage={handlePageChange}
            onChangePerPage={handlePerPageChange}
            isLoading={communicationHistoryLoading}
            totalItem={communicationHistory.length}
          />
        ) : null}
      </div>
      <CommonModal
        title={getString('text.voiceFile')}
        open={showConfirmModal}
        handleCloseModal={() => {
          setShowConfirmModal(false);
          setCallId('');
        }}
        wrapperClass={voiceModalClasses.voiceModalDialog}
      >
        {voiceModal}
      </CommonModal>
    </Grid>
  );
}

export default memo(CommunicationTable);
