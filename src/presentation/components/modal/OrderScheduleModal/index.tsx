import React, { useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { of } from 'rxjs';
import { concatMap, pluck } from 'rxjs/operators';

import CustomerApi from 'data/gateway/api/services/customer';
import OrderApi from 'data/gateway/api/services/order';
import ScheduleModal from 'presentation/components/scheduleModal';
import {
  getAppointment,
  saveAppointment,
} from 'presentation/redux/actions/leadDetail/scheduleModal';
import { getString } from 'presentation/theme/localization';
import { IDeleteAppointment } from 'shared/interfaces/common/lead/detail';

import OrderScheduleModalHelper from './OrderScheduleModal.helper';

import {
  IGetAppointmentDetail,
  IOrderAppointment,
  ISaveAppointment,
  IScheduleData,
} from '../../scheduleModal/scheduleModalHelper';
import { handleDeleteAppointment } from '../LeadScheduleModal/helper';

interface IOrderScheduleModal {
  isOpen: boolean;
  onClose: () => void;
  schedulerData: IScheduleData;
  saveAppointment: (payload: ISaveOrderAppointment) => void;
  getAppointment: (date: string, filter: string) => void;
  loading: boolean;
}

interface ISaveOrderAppointment {
  startTime: string;
  endTime: string;
  orderAppointment: IOrderAppointment;
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
const customerApi = new CustomerApi();

function OrderScheduleModal({
  isOpen,
  onClose,
  schedulerData,
  saveAppointment: handleSaveSchedule,
  getAppointment: handleGetAppointment,
  loading,
}: IOrderScheduleModal) {
  const orderName = useSelector(
    (state: any) => state.order?.payload?.name || ''
  );

  const dispatch = useDispatch();

  const handleSubmit = (payload: ISaveAppointment, formFilter: any) => {
    const appointmentPayload: ISaveOrderAppointment = {
      startTime: payload.startTime,
      endTime: payload.endTime,
      orderAppointment: {
        subject: payload.appointment.subject,
        order: orderName,
        appointmentType: 'requested',
        purpose: payload.appointment.appointmentType,
        urgent: formFilter.isUrgent,
      },
    };

    handleSaveSchedule(appointmentPayload);
  };

  const handleOrderGetAppointment = useCallback(
    (startDate: string) => {
      handleGetAppointment(startDate, 'resource:"orders/"');
    },
    [handleGetAppointment]
  );

  const handleGetAppointmentDetail: IGetAppointmentDetail = (
    payload,
    callback
  ) => {
    const { order } = payload as IOrderAppointment;

    orderApi
      .getOrder(order)
      .pipe(
        pluck('data'),
        concatMap((orderResponse: any) => {
          if (orderResponse.customer) {
            return customerApi.getCustomer(orderResponse.customer).pipe(
              pluck('data'),
              concatMap((customerResponse: any) => {
                return of({
                  ...orderResponse,
                  customer: customerResponse,
                });
              })
            );
          }

          return of(orderResponse);
        })
      )
      .subscribe((response: any) => {
        callback({
          humanId: {
            id: response.humanId,
            label: getString('timeSlotCallBack.orderID'),
          },
          name: `${response.customer?.firstName ?? ''} ${
            response.customer?.lastName ?? ''
          }`,
          detailLink: `/orders/${response.name.replace(/^orders\//, '')}`,
        });
      });
  };

  return (
    <ScheduleModal
      openDialog={isOpen}
      closeDialog={onClose}
      schedulerData={schedulerData}
      appointmentOptions={appointmentOptions}
      HelperScheduleData={OrderScheduleModalHelper}
      onSubmit={handleSubmit}
      onGetAppointment={handleOrderGetAppointment}
      onGetAppointmentDetail={handleGetAppointmentDetail}
      loading={loading}
      initialFilter={{ isUrgent: false }}
      handleDeleteAppointment={(data: IDeleteAppointment) => {
        handleDeleteAppointment(data, dispatch, onClose);
      }}
    />
  );
}

const mapStateToProps = (state: any) => ({
  schedulerData:
    state?.leadsDetailReducer?.listAppointment?.data?.appointmentData,
  loading: state?.leadsDetailReducer?.listAppointment?.data?.loading,
});
const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      getAppointment,
      saveAppointment,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(OrderScheduleModal);
