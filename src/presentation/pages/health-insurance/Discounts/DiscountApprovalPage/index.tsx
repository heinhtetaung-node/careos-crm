import { Card, CardContent, Grid } from '@material-ui/core';
import _orderBy from 'lodash/orderBy';
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';

import {
  columns,
  filterFields,
  tableInitialValues,
  localeDiscountType,
  leadMapped,
} from 'presentation/pages/car-insurance/Discounts/DiscountApprovalPage/config';
import {
  useLazyGetDiscountsRequestQuery,
  useDiscountApprovalMutation,
  useGetAllCampaignsQuery,
  useLazyGetDiscountRequestDocumentsQuery,
} from 'data/slices/discountSlice';
import { ApprovalStatusTypes } from 'data/slices/discountSlice/types';
import { initialPageState } from 'data/slices/importSlices/helper';
import { useLazyGetAllUserStreamingByLeadSearchQuery } from 'data/slices/userSlice';
import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import FileBrowseModal from 'presentation/components/modal/FileBrowseModal/index';
import useTableList from 'presentation/hooks/useTableList';
import { useStyles } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/index';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

import DiscountRejectModal from 'presentation/pages/car-insurance/Discounts/DiscountApprovalPage/DiscountRejectModal';
import { buildFilter } from 'utils/url';

const initialFilter = `request.status='PENDING' attributes.cancelled=false healthLead.product='products/health-insurance'&showDeleted=false`;
const initialFilterShowall = `healthLead.product='products/health-insurance'`;

const formatFilterURI = (payload: any, isAllRequests: boolean) => {
  const filterParts: string[] = [];

  const {
    agentName,
    packageType,
    salesAgentsTeams,
    discountType,
    search,
    approver,
  } = payload;
  if (discountType?.length) {
    const discountPart = `discountType="${discountType}"`;
    filterParts.push(discountPart);
  }
  if (Object.keys(search).length) {
    const { key, value }: { key: string; value: string } = search;
    if (value) {
      filterParts.push(` ${key}="${value}"`);
    }
  }

  filterParts.push(
    buildFilter(
      { agentName, packageType, salesAgentsTeams, approver },
      leadMapped
    )
  );

  if (!isAllRequests) {
    filterParts.push(initialFilter);
  } else {
    filterParts.push(initialFilterShowall);
  }

  return filterParts.join(' ');
};

const MAX_POLLING_TIMES = 10;
const POLLING_INTERVAL_MS = 500;

function DiscountApprovalPage() {
  const [
    updateDiscount,
    {
      data: updatedDiscountData,
      isLoading: isUpdatingDiscount,
      isError: isErrorDiscount,
      error,
    },
  ] = useDiscountApprovalMutation();
  const [getRequestDocuments] = useLazyGetDiscountRequestDocumentsQuery();
  const [getUsersDataFromLeadApi, { isLoading: isUsersDataLoading }] =
    useLazyGetAllUserStreamingByLeadSearchQuery();

  const classes = useStyles();
  const [selected, setSelected] = useState('');
  const [currentRow, setCurrentRow] = useState<any | null>(null);
  const [currentDocuments, setCurrentDocuments] = useState<Array<any> | null>(
    null
  );
  const [isModal, setModal] = useState(false);
  const [isPreviewModal, setPreviewModal] = useState(false);
  const [isGettingDocuments, setIsGettingDocuments] = useState(false);
  const [filterURI, setFilterURI] = useState(initialFilter);
  const [discountTypes, setDiscountTypes] = useState([
    ...localeDiscountType,
    { key: 3, title: getString('text.loading'), value: '' },
  ]);
  const [isAllRequests, setIsAllRequests] = useState(false);

  const dispatch = useDispatch();
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingGenerationRef = useRef<number>(0);

  const handleSelect = useCallback((id: string) => {
    setSelected((prevId) => (prevId === id ? '' : id));
  }, []);

  const enablePreviewButton = true;
  const enableAllRequests = true;

  const { TableComponent, TopComponent, refetch } = useTableList(
    'discountsApproval',
    columns((row: any) => {
      setCurrentRow(row);
    }, enablePreviewButton).map((column) =>
      column.field !== 'insuranceType'
        ? column
        : {
            id: 'category',
            field: 'category',
            label: 'leadDetailFields.productCategory',
            minWidth: 250,
            sorting: 'none',
            disabled: true,
          }
    ),
    {
      ...initialPageState,
      filter: filterURI,
    },
    useLazyGetDiscountsRequestQuery,
    selected,
    handleSelect,
    [false]
  );
  const { data: allCampaigns, isLoading: isGettingAllCampaigns } =
    useGetAllCampaignsQuery({
      filter: 'product="products/health-insurance"',
    });

  useEffect(() => {
    const fetchRequestDocuments = async (name: string) => {
      const response = await getRequestDocuments({ name });
      if (response?.data?.documents) setIsGettingDocuments(false);
      setCurrentDocuments(response?.data?.documents as IUploadedDocument[]);
    };
    if (currentRow?.name) {
      setIsGettingDocuments(true);
      fetchRequestDocuments(currentRow?.name);
      setPreviewModal(true);
    }
  }, [currentRow, getRequestDocuments]);

  const handleRejectModal = useCallback(
    () => setModal((state) => !state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isModal]
  );

  const handleSubmit = (payload: any) => {
    setFilterURI(formatFilterURI(payload, isAllRequests));
  };

  const handleResetFilter = () => {
    setFilterURI(initialFilter);
  };

  const updateDiscountStatus = useCallback(
    ({
      status,
      approverRemark,
    }: {
      status: ApprovalStatusTypes;
      approverRemark?: string;
    }) => {
      updateDiscount({
        body: {
          status: ApprovalStatusTypes[status] ?? ApprovalStatusTypes.REJECTED,
          approverRemark,
        },
        name: selected,
      });
    },
    [selected, updateDiscount]
  );

  const handleApprove = useCallback(() => {
    updateDiscountStatus({
      status: ApprovalStatusTypes.APPROVED,
    });
  }, [updateDiscountStatus]);

  const handleReject = useCallback(
    (approverRemark: string) => {
      updateDiscountStatus({
        status: ApprovalStatusTypes.REJECTED,
        approverRemark,
      });
      handleRejectModal();
    },
    [updateDiscountStatus, handleRejectModal]
  );

  const keepPollingRefetch = useCallback(
    (name: string, generation: number, attempt = 0) => {
      if (attempt >= MAX_POLLING_TIMES) {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('text.listingNotUpdated'),
            status: CONSTANTS.snackBarConfig.type.error,
          })
        );
        return;
      }

      refetch()
        .then((res: any) => {
          // Check if this polling session was cancelled while request was pending
          if (generation !== pollingGenerationRef.current) {
            return;
          }

          const dataIsStillExists = res?.data?.imports?.find(
            (item: any) => item.name?.replace('requests/', '') === name
          );

          if (dataIsStillExists) {
            pollingTimeoutRef.current = setTimeout(() => {
              keepPollingRefetch(name, generation, attempt + 1);
            }, POLLING_INTERVAL_MS);
          }
        })
        .catch((err: any) => {
          // Only log errors if this polling session is still active
          if (generation === pollingGenerationRef.current) {
            console.log(err);
          }
        });
    },
    [dispatch, refetch]
  );
  useEffect(() => {
    if (updatedDiscountData?.status && !isUpdatingDiscount) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString(
            `menu.discounts.${
              updatedDiscountData?.status === 'APPROVED'
                ? 'discountApprove'
                : 'discountReject'
            }`
          ),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
      const requestName = updatedDiscountData?.name?.split('/requests/')?.[1];
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current as any);
        pollingTimeoutRef.current = null as any;
      }
      // Increment generation to cancel any in-progress polling
      pollingGenerationRef.current += 1;
      if (requestName)
        keepPollingRefetch(requestName, pollingGenerationRef.current);
    } else if (!isUpdatingDiscount && isErrorDiscount) {
      const err = error as any;
      dispatch(
        showSnackBar({
          isOpen: true,
          message:
            err?.status === 400
              ? getString('menu.discounts.permissionError')
              : getString('importFileStatus.error'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedDiscountData, isUpdatingDiscount]);

  useEffect(() => {
    if (!isGettingAllCampaigns && allCampaigns?.campaigns?.length) {
      const allCampaignTypes = _orderBy(
        allCampaigns.campaigns.map((campaign: any, index: number) => ({
          key: 2 + index,
          title: campaign.campaignCode,
          value: campaign.campaignCode,
        })),
        ['title'],
        ['asc']
      );
      setDiscountTypes([
        ...localeDiscountType.filter((discount) => discount.key !== 1),
        ...allCampaignTypes,
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGettingAllCampaigns]);

  useEffect(
    () => () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      // Increment generation to cancel any in-progress polling
      pollingGenerationRef.current += 1;
    },
    []
  );

  const onAllRequests = useCallback((value: boolean, isReset: boolean) => {
    setIsAllRequests(value);
    if (isReset) handleResetFilter();
  }, []);

  const getApproverUsersData = () =>
    getUsersDataFromLeadApi(
      `filter=user.role.keyword in("roles/manager", "roles/supervisor") user.product="products/health-insurance"`
    );
  const getAgentNameUsersData = () =>
    getUsersDataFromLeadApi(
      `filter=user.role.keyword in("roles/sales") user.product="products/health-insurance"`
    );
  const discountApprovalFilter = useMemo(
    () => {
      const fields = filterFields(discountTypes, 'products/health-insurance');
      // For approver dropdown
      fields.splice(1, 1, {
        InputComponent: Controls.Autocomplete,
        inputProps: {
          name: 'approver',
          label: getString('text.approver'),
          async: true,
          onFocusFn: getApproverUsersData,
          loading: isUsersDataLoading,
          apiDataField: 'users',
          labelField: 'fullName',
          valueField: 'name',
          filterType: 'summary',
          fixedLabel: true,
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      });
      // For agent name dropdown
      fields.splice(3, 1, {
        InputComponent: Controls.Autocomplete,
        inputProps: {
          name: 'agentName',
          label: getString('text.agentName'),
          async: true,
          onFocusFn: getAgentNameUsersData,
          loading: isUsersDataLoading,
          apiDataField: 'users',
          labelField: 'fullName',
          valueField: 'name',
          filterType: 'detail',
          fixedLabel: true,
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      });
      return fields;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isUsersDataLoading, discountTypes]
  );

  return (
    <div
      data-testid="discount-approval-page"
      className={classes.importCustomerProfile}
    >
      <Helmet title="Discounts - Approval Page" />
      <Grid container>
        <Card>
          <CardContent>
            <Grid container>
              <Grid item xs={12} md={12} lg={12}>
                <FilterPanel
                  fields={discountApprovalFilter}
                  initialValues={{
                    ...tableInitialValues,
                    search: {
                      key: 'healthLead.humanId',
                      value: '',
                    },
                  }}
                  onSubmit={handleSubmit}
                  onReset={handleResetFilter}
                  isAllRequests={isAllRequests}
                  onAllRequests={onAllRequests}
                  showAllRequestCheckbox={enableAllRequests}
                />
              </Grid>
            </Grid>
            <Grid container item xs={12} lg={12} className={classes.controlBtn}>
              <Grid item className={classes.btnGroup}>
                <Controls.Button
                  disabled={selected.length === 0}
                  text={`${getString('text.approve')}`}
                  color="primary"
                  onClick={() => handleApprove()}
                  id="discount-approve"
                />
                <Controls.Button
                  disabled={selected.length === 0}
                  text={`${getString('text.reject')}`}
                  color="primary"
                  onClick={handleRejectModal}
                  id="discount-reject"
                />
              </Grid>
              <Grid item className={classes.btnGroup}>
                <TopComponent />
              </Grid>
            </Grid>
            <div className={classes.table}>
              <TableComponent />
            </div>
          </CardContent>
        </Card>
      </Grid>
      <FileBrowseModal
        isLoading={isGettingDocuments}
        openDialog={isPreviewModal}
        handleCloseDialog={() => {
          setPreviewModal(false);
          setCurrentDocuments(null);
          setCurrentRow(null);
        }}
        disabledFileUpload
        disabledFileDeleted
        isOtherDocuments
        documents={currentDocuments?.length ? currentDocuments : []}
      />
      {isModal && (
        <DiscountRejectModal
          isModalOpen={isModal}
          onModalClose={handleRejectModal}
          handleReject={handleReject}
        />
      )}
    </div>
  );
}

export default DiscountApprovalPage;
