import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import OrderApi from 'data/gateway/api/services/order';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import {
  useAddAppointmentMutation,
  useLazyGetAppointmentsQuery,
} from 'data/slices/leadDetailSlices/appointmentSlice';
import ScheduleModal from 'presentation/components/scheduleModal';
import {
  formatUserId,
  handleData,
} from 'presentation/redux/epics/leadDetail/scheduleModal/scheduleModal.helper';
import { getString } from 'presentation/theme/localization';
import { IDeleteAppointment } from 'shared/interfaces/common/lead/detail';
import useSnackbar from 'utils/snackbar';

import OrderScheduleModalHelper from './OrderScheduleModal.helper';

import {
  IGetAppointmentDetail,
  IOrderAppointment,
  ISaveAppointment,
} from '../../scheduleModal/scheduleModalHelper';
import { handleDeleteAppointment } from '../LeadScheduleModal/helper';

interface IOrderScheduleModal {
  isOpen: boolean;
  onClose: () => void;
}

enum AppointmentPurpose {
  DOCUMENT_FOLLOW_UP = 'DOCUMENT_FOLLOW_UP',
  WRONG_DOCUMENT = 'WRONG_DOCUMENT',
}

const appointmentOptions = () => [
  {
    id: AppointmentPurpose.DOCUMENT_FOLLOW_UP,
    title: getString('text.followup'),
  },
  {
    id: AppointmentPurpose.WRONG_DOCUMENT,
    title: getString('text.wrongDocument'),
  },
];

const orderApi = new OrderApi();
function OrderScheduleModalSlice({
  isOpen,
  onClose,
}: Readonly<IOrderScheduleModal>) {
  const orderName = useSelector(
    (state: any) => state.order?.payload?.name || ''
  );
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [
    getAppointments,
    { data: schedulerData, isFetching: getAppointmentLoading },
  ] = useLazyGetAppointmentsQuery();

  const [addAppointment] = useAddAppointmentMutation();
  const dispatch = useDispatch();
  const { data: user } = useGetAuthenticateQuery();

  const handleSubmit = async (payload: ISaveAppointment, formFilter: any) => {
    const response = await addAppointment({
      userId: formatUserId(user?.name ?? ''),
      payload: {
        startTime: payload.startTime,
        endTime: payload.endTime,
        orderAppointment: {
          subject: payload.appointment.subject,
          order: orderName,
          appointmentType: 'requested',
          purpose: payload.appointment.appointmentType,
          urgent: formFilter.isUrgent,
        },
      },
    }).unwrap();
    if (response?.error) {
      showErrorSnackbar(response.error?.data?.message);
    } else {
      showSuccessSnackbar(getString('text.createAppointmentSuccess'));
    }
  };

  const handleGetOrderAppointment = async (startDate: string) => {
    const response = await getAppointments({
      startDate,
      filter: 'resource:"orders/"',
    });
    if (response?.isError) {
      showErrorSnackbar((response.error as any).data.message);
    }
  };

  const handleGetAppointmentDetail: IGetAppointmentDetail = (
    payload,
    callback
  ) => {
    const { order } = payload as IOrderAppointment;
    orderApi.getOrder(order).subscribe((response: any) => {
      callback({
        humanId: {
          id: response.humanId,
          label: getString('timeSlotCallBack.orderID'),
        },
        name: `${response.customer?.firstName ?? ''} ${
          response.customer?.lastName ?? ''
        }`,
        detailLink: `/orders/${response?.data?.name?.replace(/^orders\//, '')}`,
      });
    });
  };

  return (
    <ScheduleModal
      openDialog={isOpen}
      closeDialog={onClose}
      schedulerData={schedulerData && handleData(schedulerData)}
      appointmentOptions={appointmentOptions}
      HelperScheduleData={OrderScheduleModalHelper}
      onSubmit={handleSubmit}
      onGetAppointment={handleGetOrderAppointment}
      onGetAppointmentDetail={handleGetAppointmentDetail}
      loading={getAppointmentLoading}
      initialFilter={{ isUrgent: false }}
      handleDeleteAppointment={(data: IDeleteAppointment) => {
        handleDeleteAppointment(data, dispatch, onClose);
      }}
    />
  );
}

export default OrderScheduleModalSlice;
