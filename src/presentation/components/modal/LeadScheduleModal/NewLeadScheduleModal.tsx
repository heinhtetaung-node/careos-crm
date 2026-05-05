import { Modal } from '@material-ui/core';
import React from 'react';

import { useAddAppointmentMutation } from 'data/slices/leadDetailSlices/appointmentSlice';
import { formatUserId } from 'presentation/redux/epics/leadDetail/scheduleModal/scheduleModal.helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';
import { isBefore } from 'utils/datetime';
import useSnackbar from 'utils/snackbar';

import {
  formatDateForAppointmentQuery,
  getEndTime,
} from './LeadScheduleModal.helper';
import Schedule from './Schedule';

interface LeadScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isViewOnly?: boolean;
}

function NewLeadScheduleModal({
  isOpen,
  onClose,
  isViewOnly,
}: LeadScheduleModalProps) {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const [addAppointment] = useAddAppointmentMutation();

  const user = useGetUserSelector();
  const lead = useGetLeadSelector();

  const handleSubmit = async (values: {
    appointmentType: string;
    subject: string;
    isPaymentCall: string;
    startTime: Date | number | string | undefined;
    lengthOfCall: number | undefined;
  }) => {
    if (isBefore(new Date(values.startTime as any), new Date())) {
      showErrorSnackbar(getString('text.passedBookingTime'));
      return;
    }
    const response = await addAppointment({
      userId: formatUserId(user.name),
      payload: {
        startTime: formatDateForAppointmentQuery(values.startTime as string),
        endTime: formatDateForAppointmentQuery(
          getEndTime(values.startTime as string, values.lengthOfCall as number)
        ),
        appointment: {
          appointmentType: values.appointmentType,
          subject: values.subject,
          lead: lead.name,
          payment: values.isPaymentCall === 'yes',
        },
      },
    });
    if ('error' in response) {
      showErrorSnackbar((response.error as any).data.message);
    } else {
      showSuccessSnackbar(getString('text.createAppointmentSuccess'));
      onClose();
    }
  };
  return (
    <Modal open={isOpen}>
      <Schedule
        onClose={onClose}
        handleSubmit={handleSubmit}
        isViewOnly={isViewOnly}
        leadData={lead}
      />
    </Modal>
  );
}

export default NewLeadScheduleModal;
