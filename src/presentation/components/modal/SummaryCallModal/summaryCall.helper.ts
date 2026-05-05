import * as Yup from 'yup';

import { getString } from 'presentation/theme/localization';
import { format } from 'utils/datetime';

type AppointmentType = {
  name: string;
  startTime: string;
  status: string;
};

export const getAppointmentListOptions = (appointments: AppointmentType[]) =>
  appointments
    .filter((appointment: AppointmentType) => appointment.status !== 'CALLED')
    .map((appointment: AppointmentType) => ({
      id: appointment.name,
      value: appointment.name,
      title: format(
        new Date(appointment.startTime.replace('Z', '+0700')),
        'hh:mm'
      ),
    }));

export const policyEndDateRequiredRejectionReason = [
  'customer_comparing_insurance_price',
  'purchased_from_others_during_sales_process',
  'not_expiring',
  'already_purchased',
  'expensive',
  'purchased_directly_from_insurer',
  'car_not_in_use',
  'failed_uw_unable_to_insure',
  'dissatisfied_with_service',
  'customer_didnot_get_same_installment_as_last_year',
  'blacklist_ci',
  'customer_not_comfortable_with_credit_card_fee',
  'payment_not_convenient',
  'cancellation_during_year',
];

export const createValidationSchema = () =>
  Yup.object().shape({
    comment: Yup.string().trim().required('Required'),
    status: Yup.string().trim(),
    approved: Yup.boolean(),
    reason: Yup.string().when('approved', {
      is: (approved: boolean) => approved,
      then: (schema) => schema.required('Required'),
    }),
    policyExpiryDate: Yup.date().nullable(),
  });

export const callSummaryValidation = () =>
  Yup.object().shape({
    comment: Yup.string().trim().required(getString('text.required')),
    status: Yup.string().trim().required(getString('text.required')),
    isRejected: Yup.boolean(),
    reason: Yup.string().when('isRejected', {
      is: (isRejected: boolean) => isRejected,
      then: (schema) => schema.required(getString('text.required')),
    }),
    policyExpiryDate: Yup.date().nullable(),
  });
export interface SummaryForm {
  comment: string;
  remark: string;
  isRejected: boolean;
  reason?: string;
  status: string;
  policyExpiryDate?: Date;
  appointment?: string;
}

export default createValidationSchema;
