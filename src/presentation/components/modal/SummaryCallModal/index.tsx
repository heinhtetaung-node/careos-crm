import { Button, Divider, TextArea } from '@alphafounders/ui';
import { useFormik } from 'formik';
import { get } from 'lodash';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useCreateCallSummaryMutation } from 'data/slices/callSummarySlice';
import { useGetTodayAppointmentsQuery } from 'data/slices/leadDetailSlices/appointmentSlice';
import { useGetRejectionReasonsQuery } from 'data/slices/rejectionSlice';
import { LeadStatus } from 'mock-data/LeadSourceSelect.mock';
import Controls from 'presentation/components/controls/Control';
import { hideModal } from 'presentation/redux/actions/ui';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { handleGenericStructureError } from 'shared/helper/ErrorHelper';
import {
  startOfDay,
  endOfDay,
  format,
  isBefore,
  DateType,
} from 'utils/datetime';
import useSnackbar from 'utils/snackbar';

import {
  getAppointmentListOptions,
  policyEndDateRequiredRejectionReason,
  SummaryForm,
  callSummaryValidation,
} from './summaryCall.helper';

import {
  formatDateForAppointmentQuery,
  getEndTime,
} from '../LeadScheduleModal/LeadScheduleModal.helper';
import Schedule from '../LeadScheduleModal/Schedule';

interface SummaryCallModal {
  enableAppointmentSelection?: boolean;
}

function SummaryCallModal({
  enableAppointmentSelection = true,
}: Readonly<SummaryCallModal>) {
  const lead = useGetLeadSelector();

  const user = useGetUserSelector();

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const [createCallSummary, { isLoading: createCallSummaryLoading }] =
    useCreateCallSummaryMutation();

  const formik = useFormik<SummaryForm>({
    initialValues: {
      comment: '',
      remark: lead.annotations?.remark ?? '',
      isRejected: false,
      reason: '',
      status: lead.status,
      policyExpiryDate: undefined,
      appointment: '',
    },
    onSubmit: () => undefined,
    validationSchema: callSummaryValidation(),
    validateOnChange: true,
    enableReinitialize: true,
  });

  const { data: rejectionReasonsResponse } = useGetRejectionReasonsQuery(
    undefined,
    { skip: !formik.values.isRejected }
  );

  const { data: appointments } = useGetTodayAppointmentsQuery(
    {
      resource: lead.name,
      createBy: user.name,
      startTime: startOfDay(new Date()),
      endTime: endOfDay(new Date()),
    },
    {
      skip: !enableAppointmentSelection,
    }
  );

  const handleSubmit = async (appointmentParams?: {
    appointmentType: string;
    subject: string;
    isPaymentCall: string;
    startTime: DateType | undefined;
    lengthOfCall: number | undefined;
  }) => {
    await formik.validateForm();
    if (!formik.isValid) {
      return;
    }
    if (
      appointmentParams?.startTime &&
      isBefore(new Date(appointmentParams.startTime as string), new Date())
    ) {
      showErrorSnackbar(getString('text.passedBookingTime'));
      return;
    }
    const response = await createCallSummary({
      parent: lead.name,
      remark: formik.values.remark,
      comment: formik.values.comment,
      rejectionReason: formik.values.isRejected
        ? formik.values.reason
        : undefined,
      policyExpiryDate: formik.values.policyExpiryDate
        ? format(formik.values.policyExpiryDate, 'yyyy-MM-dd')
        : '',
      leadStatus: formik.values.status,
      currentEvent: formik.values.appointment,
      upcomingEvent: appointmentParams
        ? {
            calendar: `calendars/${user.name.split('/')[1]}`,
            event: {
              startTime: formatDateForAppointmentQuery(
                appointmentParams?.startTime ?? ''
              ),
              endTime: formatDateForAppointmentQuery(
                getEndTime(
                  appointmentParams?.startTime ?? '',
                  appointmentParams.lengthOfCall as number
                )
              ),
              appointment: {
                appointmentType: appointmentParams.appointmentType,
                lead: lead.name,
                payment: appointmentParams.isPaymentCall === 'yes',
                subject: appointmentParams.subject,
              },
            },
          }
        : undefined,
    });
    if ('error' in response) {
      const errorDetailResponse: any = get(response, 'error.data.details');
      const errorResponse: any = get(response, 'error.data.message');

      if (errorDetailResponse.length > 0) {
        const errorMessage: string[] =
          handleGenericStructureError(errorDetailResponse);

        showErrorSnackbar(errorMessage.join('. '));
      } else {
        showErrorSnackbar(getString(`errors.${errorResponse}`));
      }
    } else {
      showSuccessSnackbar(getString('text.summaryModalUpdateSuccessful'));
      dispatch(hideModal(CONSTANTS.ModalConfig.leadSummaryCallModal));
    }
  };

  const leadStatusOptions = useMemo(
    () =>
      LeadStatus.map((status) => ({
        ...status,
        title: getString(status.title),
      })),
    []
  );

  const rejectOptions = useMemo(
    () => [
      { id: 1, value: true, title: getString('genericOption.yes') },
      { id: 2, value: false, title: getString('genericOption.no') },
    ],
    []
  );

  const rejectionReasons = useMemo(
    () =>
      rejectionReasonsResponse?.map((r) => ({
        ...r,
        title: getString(r.title),
      })) ?? [],
    [rejectionReasonsResponse]
  );

  const appointmentOptions = useMemo(
    () => getAppointmentListOptions(appointments ?? []),
    [appointments]
  );

  return (
    <div className="p-2">
      <div className="text-left text-primary font-bold">
        {getString('text.changeStatus')}
      </div>
      <Divider variant="secondary" />
      <div className="flex flex-row flex-wrap gap-3">
        <div className="w-[25rem] grow">
          <Controls.Select
            name="status"
            value={formik.values.status}
            label={getString('text.leadStatus')}
            placeholder={getString('text.pleaseSelect')}
            onChange={(e) => {
              formik.setFieldValue('status', e.target.value);
            }}
            error={Boolean(formik.errors.status)}
            errorType={formik.errors.status}
            fixedLabel
            options={leadStatusOptions}
            selectField="value"
            required
          />
        </div>
        <div className="w-[25rem] grow" data-testid="is-rejected">
          <Controls.Select
            name="reject"
            value={formik.values.isRejected}
            label={getString('text.reject')}
            placeholder={getString('text.pleaseSelect')}
            onChange={async (e) => {
              await formik.setFieldValue(
                'isRejected',
                e.target.value === 'true'
              );
              if (e.target.value === 'false') {
                await formik.setFieldValue('reason', '');
              }
            }}
            error={Boolean(formik.errors.isRejected)}
            errorType={formik.errors.isRejected}
            fixedLabel
            options={rejectOptions}
            selectField="value"
            required
          />
        </div>
        <div className="w-[25rem] grow" data-testid="rejection-reason">
          <Controls.Select
            name="reason"
            value={formik.values.reason}
            disabled={!formik.values.isRejected}
            label={getString('text.rejectionReason')}
            placeholder={getString('text.pleaseSelect')}
            onChange={(e) => {
              formik.setFieldValue('reason', e.target.value);
            }}
            error={Boolean(formik.errors.reason)}
            errorType={formik.errors.reason}
            options={rejectionReasons}
            selectField="value"
            required
            fixedLabel
          />
        </div>
        <div className="w-[25rem] grow" data-testid="comment">
          <TextArea
            label={getString('text.comment')}
            value={formik.values.comment}
            error={formik.errors.comment}
            onChange={(e) => {
              formik.setFieldValue('comment', e.target.value);
            }}
          />
        </div>
        <div className="w-[25rem] grow" data-testid="remark">
          <TextArea
            label={getString('text.remark')}
            value={formik.values.remark}
            onChange={(e) => {
              formik.setFieldValue('remark', e.target.value);
            }}
            error={formik.errors.remark}
          />
        </div>
        <div className="w-[25rem] grow">
          <Controls.Select
            name="appointments"
            value={formik.values.appointment}
            disabled={!enableAppointmentSelection}
            label={getString('text.appointment')}
            placeholder={getString('text.selectAppointment')}
            onChange={(e) => {
              formik.setFieldValue('appointment', e.target.value);
            }}
            options={appointmentOptions}
            selectField="value"
            required
            fixedLabel
            error={Boolean(formik.errors.appointment)}
            errorType={formik.errors.appointment}
          />
        </div>
        <div className="w-[28rem] grow max-w-[28rem] text-left">
          {policyEndDateRequiredRejectionReason.includes(
            formik.values.reason || ''
          ) && (
            <Controls.KeyBoardDatePicker
              name="policyExpiryDate"
              value={formik.values.policyExpiryDate?.toDateString() || ''}
              label={getString('text.policyExpiryDate')}
              className=""
              invalidDateMessage
              minDateMessage={false}
              onChange={(date: Date | null) => {
                formik.setFieldValue('policyExpiryDate', date);
              }}
              helperText={formik.errors.policyExpiryDate}
              autoOk
              disableToolbar
              placeholder="DD/MM/YYYY"
              fixedLabel
              required={false}
            />
          )}
        </div>
      </div>
      {!formik.values.isRejected && (
        <div data-testid="appointment-section">
          <div className="text-left text-primary font-bold mt-4">
            {getString('timeSlotCallBack.appointment')}
          </div>
          <Divider variant="secondary" />
          <Schedule
            disableSubmit={!formik.isValid}
            isSaveOnly
            includeTitleBar={false}
            handleSubmit={(values) => handleSubmit(values)}
            onSubmitClick={formik.validateForm}
            onClose={() => null}
            refreshOnCancelAppointment
          />
        </div>
      )}
      {formik.values.isRejected && (
        <Button
          disabled={!formik.isValid}
          className="mx-auto py-3 px-4 my-3"
          text={getString('text.save')}
          onClick={() => handleSubmit()}
          isLoading={createCallSummaryLoading}
        />
      )}
    </div>
  );
}

export default SummaryCallModal;
