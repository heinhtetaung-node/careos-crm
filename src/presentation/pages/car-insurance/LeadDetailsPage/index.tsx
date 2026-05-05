import { Grid, makeStyles, Theme } from '@material-ui/core';
import { skipToken } from '@reduxjs/toolkit/query';
import isEqual from 'lodash/isEqual';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { UserRoles } from 'config/constant';
import AssignApi from 'data/gateway/api/services/assign';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useLazyGetCarDataQuery } from 'data/slices/carSlice';
import {
  useCreateCustomerEmailMutation,
  useCreatePhoneNumberMutation,
  useGetConnectedLeadsQuery,
  useLazyGetCustomerEmailQuery,
  useLazyGetCustomerPhoneNumberQuery,
  useLazyGetCustomerQuery,
} from 'data/slices/customerSlice';
import { PhoneResponse } from 'data/slices/customerSlice/types';
import { useGetLeadRejectionByIdQuery } from 'data/slices/rejectionSlice';
import NotFound from 'presentation/components/NotFound';
import {
  useLeadPitchChecklistSection,
  type LeadAssignment,
} from 'presentation/hooks/useLeadPitchChecklist';
import { IInsurer } from 'presentation/models/lead/insurer';
import { subscribeLeadMailUpdates } from 'presentation/redux/actions/leadActivity';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { getListInsurer } from 'presentation/redux/actions/leadDetail/insurer';
import { destroyModalSchedule } from 'presentation/redux/actions/leadDetail/scheduleModal';
import {
  subscribeLeadUpdates,
  setHasShowedSummary,
} from 'presentation/redux/actions/leads/detail';
import { showModal } from 'presentation/redux/actions/ui';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';
import * as CONSTANTS from 'shared/constants';
import { PhoneNumber } from 'shared/types/customer';
import { getUserRoleAccessLead } from 'utils/userRolesAccess';

import PitchChecklistPanel from 'presentation/components/PitchChecklistPanel';
import { useUpdateCustomer } from './Hooks/useUpdate';
import LeadDetailsHeader from './LeadDetailsComponents/leadDetailsHeader';
import LeadDetailsModals from './LeadDetailsComponents/leadDetailsModals';
import LeadDetailsSections from './LeadDetailsComponents/leadDetailsSections';
import {
  fakeInsurers,
  formatCarInfo,
  formatInsurerInfo,
  initialCarData,
  initialInsurerData,
  IInsurerFromApi,
  IInsurerItem,
  LIST_INSURERS_PAGE_SIZE,
  canViewLead,
  customCarData,
  clearSub$,
  sortPreferedInsurers,
  getPendingRejection,
  ICarInfo,
  isMotorLead,
} from './leadDetailsPage.helper';

import './index.scss';

interface LeadPageSelectorProps {
  callState: any;
  currentCustomer: any;
  listInsurer: IInsurerFromApi;
  hasError: boolean;
  success: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  grid: {
    '& .MuiButton-outlinedPrimary': {
      border: `1px solid ${theme.palette.info.main}`,
    },
    '& .MuiBadge-anchorOriginTopRightRectangle': {
      transform: 'scale(1) translate(-50%, -50%)',
    },
    '& .MuiBadge-anchorOriginTopRightRectangle.MuiBadge-invisible': {
      display: 'none',
    },
  },
}));

export function LeadPage() {
  const [carInfo, setCarInfo] = useState<ICarInfo>(initialCarData);

  // INFO: get lead id from path
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [_insurerInfo, setInsurerInfo] = useState<IInsurer>(initialInsurerData);
  const [preferredInsurersList, setPreferredInsurersList] =
    useState<IInsurerItem[]>(fakeInsurers);
  const [carGeneral, setCarGeneral] = useState({
    brand: '',
    model: '',
    year: 0,
    subModel: '',
    fuelType: '',
    transmissionType: '',
    engineSize: 0,
    cabType: '',
    sumInsuredMax: 0,
    isCurated: false,
    isVan: false,
  });

  const [getCarData] = useLazyGetCarDataQuery();

  const {
    callState,
    currentCustomer,
    success,
    hasError,
    listInsurer,
  }: LeadPageSelectorProps = useAppSelector(
    (state) => ({
      callState: state.leadsDetailReducer.callReducer.data,
      currentCustomer: state.leadsDetailReducer.lead?.payload,
      success: state.leadsDetailReducer.lead.success,
      hasError: !!state.leadsDetailReducer.lead.error,
      listInsurer:
        state.leadsDetailReducer.getListInsurerReducer.data?.listInsurer,
    }),
    isEqual
  );

  const [assignmentResponse, setAssignementResponse] = useState<
    LeadAssignment[]
  >([]);
  const [isShowCloseSummaryModal, setIsShowCloseSummaryModal] = useState(true);
  const [isEmailNotiInvisible, setIsEmailNotiInvisible] = useState(false);
  const [isAddressNotiInvisible, setIsAddressNotiInvisible] = useState(false);
  const [isPageDisabled, setIsPageDisabled] = useState(false);
  const [leadStatus, setLeadStatus] = useState(currentCustomer.status);
  const [customerName, setCustomerName] = useState<string[]>([]);

  const params = useParams();
  const leadName = params?.id;
  const summaryModalType = {
    HANG_UP: 'hang-up',
    CHANGE_STATUS: 'change-status',
  };

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [updateCustomer] = useUpdateCustomer();
  const { id } = useParams<{ id: string }>();
  const { data: user } = useGetAuthenticateQuery();

  const {
    isLeadPitchChecklistEnabled,
    isPitchChecklistExpanded,
    setIsPitchChecklistExpanded,
    isPitchChecklistEditable,
    handlePitchChecklistCallStart,
  } = useLeadPitchChecklistSection({
    leadRouteParamId: leadName,
    user,
    assignmentResponse,
    lead: currentCustomer,
  });
  const isAssigned = canViewLead(user, assignmentResponse);
  const location = useLocation();
  const navigate = useNavigate();
  // Loading state is omitted because of call issue
  // TODO: Will be refactored with websocket and webrtc refactor of call
  const { data: rejectionData, error: rejectionError } =
    useGetLeadRejectionByIdQuery(currentCustomer?.name, {
      skip: !currentCustomer?.name,
    });

  const { data: leadResp } = useGetConnectedLeadsQuery(
    currentCustomer?.name
      ? {
          leadId: currentCustomer.name,
          currentCustomer,
        }
      : skipToken
  );

  const [getCustomer, { data: customerData }] = useLazyGetCustomerQuery();
  const [getCustomerEmail, { data: customerEmails }] =
    useLazyGetCustomerEmailQuery();
  const [createCustomerEmail] = useCreateCustomerEmailMutation();

  const [getCustomerPhoneNumber, { data: customerPhoneNumber }] =
    useLazyGetCustomerPhoneNumberQuery();
  const [createCustomerPhoneNumber] = useCreatePhoneNumberMutation();

  // RTK Queries End
  const isPendingRejection = useMemo(() => {
    if (rejectionData) {
      return getPendingRejection(rejectionData);
    }

    return false;
  }, [rejectionData]);

  const { canEdit } = getUserRoleAccessLead(user?.role as UserRoles);

  useEffect(() => {
    setIsPageDisabled(leadStatus === 'LEAD_STATUS_PURCHASED');
    setLeadStatus(currentCustomer.status);
  }, [currentCustomer.status, leadStatus, user?.role]);

  useEffect(() => {
    dispatch(
      subscribeLeadUpdates({
        leadName: leadName!,
      })
    );
    dispatch(
      subscribeLeadMailUpdates({
        leadName: leadName!,
        isApiCallForUnreadMailCountDisabled: false,
      })
    );
    // TODO: unsubscribe when user moves away from page
  }, [dispatch, leadName]);

  useEffect(() => {
    dispatch(getLead());
    // INFO: Get Insurer List
    dispatch(getListInsurer(LIST_INSURERS_PAGE_SIZE));
  }, [dispatch]);

  useEffect(() => {
    let assignSubscription: Subscription;
    if (leadName) {
      const assignApi = new AssignApi();
      assignSubscription = assignApi
        .getAssignment(leadName)
        .pipe(pluck('data'))
        .subscribe((response: any) => {
          if (response?.assignments?.length) {
            setAssignementResponse(response?.assignments);
          }
        });
    }

    return () => {
      if (assignSubscription) {
        assignSubscription.unsubscribe();
      }
    };
  }, [leadName]);

  const fetchCarData = async () => {
    const carResponse = await getCarData({
      pathParam: `brands/-/models/-/submodels/-/years/${currentCustomer.data.carSubModelYear}:getUniqueCars`,
      queryParam: {},
      field: '',
    });

    if (!carResponse.isError) {
      const resCopy: any = [...carResponse.data][0];
      const formattedCarData = customCarData(
        resCopy,
        currentCustomer.data.carSubModelYear
      );
      setCarGeneral(formattedCarData);
    }
  };

  const carSubModelYear = currentCustomer?.data?.carSubModelYear
    ? currentCustomer.data.carSubModelYear
    : undefined;

  useEffect(() => {
    if (currentCustomer?.data?.carSubModelYear) {
      fetchCarData();
    }

    return () => {
      clearSub$.next(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carSubModelYear]);

  useEffect(() => {
    if (carGeneral && currentCustomer) {
      const tempCarInfo = formatCarInfo(currentCustomer, carGeneral);
      setCarInfo(tempCarInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carGeneral, JSON.stringify(currentCustomer)]);

  useEffect(() => {
    if (listInsurer && currentCustomer) {
      setPreferredInsurersList(sortPreferedInsurers(listInsurer.insurers));
      setInsurerInfo(formatInsurerInfo(currentCustomer));
    }
  }, [listInsurer, currentCustomer]);

  const checkAndUpdateCustomer = async () => {
    const customerId = `${customerName[0]}/${customerName[1]}`;
    const {
      customerFirstName,
      customerLastName,
      customerEmail: leadEmail,
      customerPhoneNumber: leadPhoneNumber,
    } = currentCustomer.data;

    // ****************************
    // INFO: if there is change in name
    // ****************************
    await getCustomer(customerId);
    if (!customerData?.name) return;

    const { firstName, lastName } = customerData;

    if (customerFirstName !== firstName || customerLastName !== lastName) {
      updateCustomer({
        customerId,
        payload: { firstName: customerFirstName, lastName: customerLastName },
      });
    }
    // ****************************
    // INFO: if there is change in emails
    // ****************************
    await getCustomerEmail({ customerId, currentCustomer });
    if (!customerEmails?.emails) return;

    // INFO: matchedEmails are the emails that is similar to currentCustomer's emails
    const matchedEmails =
      customerEmails?.emails?.map((email: any) => email.email) || [];

    if (matchedEmails.length && matchedEmails.length !== leadEmail?.length) {
      // filtered out unwanted emails
      const filteredEmails = leadEmail?.filter(
        (email: string) => !matchedEmails.includes(email)
      );
      await Promise.all(
        filteredEmails.map(async (email: string) => {
          await createCustomerEmail({ email, customerName: customerId });
        })
      );
    }

    // ****************************
    // INFO: if there is change in phone numbers
    // ****************************

    await getCustomerPhoneNumber({ customerName: customerId });
    if (!customerPhoneNumber?.phones) return;

    let phones = customerPhoneNumber.phones.map(
      (phone: PhoneResponse) => phone.phone
    );
    const leadPhones = leadPhoneNumber.map((phone: PhoneNumber) => phone.phone);

    if (phones.length) {
      phones = phones.filter(
        (phone: any, index: number) => phones.indexOf(phone) === index
      );
      const filteredPhones = leadPhones.filter(
        (phone: string) => !phones.includes(phone)
      );
      await Promise.all(
        filteredPhones.map(async (phone: string) => {
          await createCustomerPhoneNumber({ phone, customerName: customerId });
        })
      );
    }
  };

  useEffect(() => {
    if (!currentCustomer?.data) return;
    const { customerEmail, customerPolicyAddress } = currentCustomer.data;
    setIsEmailNotiInvisible(customerEmail?.length);
    setIsAddressNotiInvisible(customerPolicyAddress?.length);

    // INFO: Check And Update Customer
    if (customerName.length) {
      checkAndUpdateCustomer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCustomer]);

  // INFO: For Schedule Modal
  const setOpenScheduleModalOnPage = () => {
    setOpenScheduleModal(true);
  };

  // INFO: For Call Summary Modal
  const handleOpenSummaryModal = useCallback(
    (type: string) => {
      const hasShowedSummary = callState?.hasShowedSummary ?? false;
      if (hasShowedSummary && type === summaryModalType.HANG_UP) {
        return;
      }

      if (type === summaryModalType.CHANGE_STATUS) {
        setIsShowCloseSummaryModal(true);
      } else if (type === summaryModalType.HANG_UP) {
        setIsShowCloseSummaryModal(false);
        dispatch(setHasShowedSummary(true));
      }

      dispatch(showModal(CONSTANTS.ModalConfig.leadSummaryCallModal));
    },
    [callState?.hasShowedSummary, dispatch, summaryModalType]
  );
  useEffect(() => {
    const hasShowedSummary = callState?.hasShowedSummary ?? false;
    if (callState.callStatus === CallStatus.End && !hasShowedSummary) {
      handleOpenSummaryModal(summaryModalType.HANG_UP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState.callStatus, callState?.hasShowedSummary]);

  const closeModalSchedule = (close: boolean) => {
    dispatch(destroyModalSchedule());
    setOpenScheduleModal(close);
  };

  const messageModalHandler = () => {
    setOpenMessageModal(true);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location?.search);
    const showMessageModal = urlParams.get('message');
    if (showMessageModal === 'true') {
      messageModalHandler();
      navigate(`/leads/${leadName}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadName]);

  useEffect(() => {
    if (leadResp?.customer?.name) {
      setCustomerName(leadResp.customer.name.split('/'));
    }
  }, [leadResp]);

  const isSuccess = success && isAssigned;

  if (
    hasError ||
    !isAssigned ||
    rejectionError ||
    !isMotorLead(currentCustomer)
  ) {
    return <NotFound />;
  }
  return (
    <div data-testid="lead-details-page-component">
      {isSuccess && (
        <>
          <Helmet title="Lead Page" />
          <Grid
            className={classes.grid}
            item
            xs={12}
            md={12}
            data-testid="lead-details-page-full-section"
          >
            <div className="lead-detail-page">
              <div className="lead-detail-page__icon" />
              <LeadDetailsHeader
                id={id!}
                customerId={
                  customerName?.length > 1
                    ? `${customerName[0]}/${customerName[1]}`
                    : ''
                }
                classes={classes}
                isPageDisabled={isPageDisabled}
                summaryModalType={summaryModalType}
                isEmailNotiInvisible={isEmailNotiInvisible}
                isAddressNotiInvisible={isAddressNotiInvisible}
                isShowCloseSummaryModal={isShowCloseSummaryModal}
                messageModalHandler={messageModalHandler}
                handleOpenSummaryModal={handleOpenSummaryModal}
                setOpenScheduleModalOnPage={setOpenScheduleModalOnPage}
                onCallStart={
                  isLeadPitchChecklistEnabled
                    ? handlePitchChecklistCallStart
                    : undefined
                }
              />
              <LeadDetailsSections
                id={id!}
                classes={classes}
                carInfo={carInfo}
                isPageDisabled={isPageDisabled || !canEdit}
                isPendingRejection={isPendingRejection}
                preferredInsurersList={preferredInsurersList}
              />
              {isLeadPitchChecklistEnabled ? (
                <PitchChecklistPanel
                  leadName={currentCustomer?.name}
                  isEditable={isPitchChecklistEditable}
                  isExpanded={isPitchChecklistExpanded}
                  onToggle={setIsPitchChecklistExpanded}
                />
              ) : null}
            </div>
          </Grid>
          <LeadDetailsModals
            classes={classes}
            openScheduleModal={openScheduleModal}
            openMessageModal={openMessageModal}
            closeModalSchedule={closeModalSchedule}
            isPendingRejection={isPendingRejection}
            setOpenMessageModal={setOpenMessageModal}
          />
        </>
      )}
    </div>
  );
}

export default LeadPage;
