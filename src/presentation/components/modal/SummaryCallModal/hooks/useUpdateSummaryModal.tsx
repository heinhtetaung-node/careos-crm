import { useDispatch } from 'react-redux';

import { useAddCommentMutation } from 'data/slices/leadDetails/commentsSlice';
import { useUpdateAppointmentMutation } from 'data/slices/leadDetailSlices/appointmentSlice';
import {
  useUpdateLeadJsonMutation,
  useUpdateLeadStatusMutation,
} from 'data/slices/leadDetailSlices/updateLeadSlice';
import { usePostLeadRejectionMutation } from 'data/slices/rejectionSlice';
import { resetCommentsScrollbar } from 'presentation/hooks/getComment';
import { hideModal, showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { format } from 'utils/datetime';

export default function useUpdateSummaryModal() {
  const dispatch = useDispatch();
  const [updateAppointment] = useUpdateAppointmentMutation();
  const [addComment] = useAddCommentMutation();
  const [postLeadRejection] = usePostLeadRejectionMutation();
  const [updateLeadStatus] = useUpdateLeadStatusMutation();
  const [updateLeadJson] = useUpdateLeadJsonMutation();

  const handleFormSubmit = async (
    leadName: string,
    currentLeadStatus: string,
    values: any,
    setLoading: (state: boolean) => void
  ) => {
    const errorArray: string[] = [];
    const leadId = `leads/${leadName}`;
    if (values.appointment) {
      updateAppointment({
        eventName: values.appointment,
        payload: {
          status: 'CALLED',
          appointment: {},
        },
        mask: ['status'],
      });
    }
    await Promise.all([
      addComment({
        text: values.comment,
        leadId,
      }),
    ]).then(async ([commentResponse]: any) => {
      resetCommentsScrollbar();
      if ('error' in commentResponse) {
        errorArray.push(commentResponse.error.data?.message);
      } else {
        const commentResponseName = commentResponse.data.name;

        if (currentLeadStatus !== values.status) {
          try {
            const updateLeadResponse: any = await updateLeadStatus({
              leadId,
              payload: {
                status: values.status,
                comment: commentResponseName,
              },
              patchType: 'updateStatus',
            });

            if ('error' in updateLeadResponse) {
              errorArray.push(updateLeadResponse.error.data.message);
            }
          } catch (e) {
            const err = e as Error;
            console.log('error in catch updateLead', err);
            newrelic?.noticeError?.(err);
          }
        }

        if (values.approved) {
          try {
            const leadRejectionResponse: any = await postLeadRejection({
              leadId,
              comment: commentResponseName,
              reason: values.reason,
            });

            if ('error' in leadRejectionResponse) {
              errorArray.push(leadRejectionResponse.error.data.message);
            } else {
              try {
                const updateLeadJsonResponse: any = await updateLeadJson({
                  leadId: leadName,
                  payload: [
                    {
                      op: 'add',
                      path: '/policyExpiryDate',
                      value: format(
                        new Date(values.policyExpiryDate),
                        'yyyy-MM-dd'
                      ),
                    },
                  ],
                });

                if ('error' in updateLeadJsonResponse) {
                  errorArray.push(updateLeadJsonResponse.error.data.message);
                }
              } catch (e) {
                const err = e as Error;
                console.log('error in catch updateLeadJson', err);
                newrelic?.noticeError?.(err);
              }
            }
          } catch (e) {
            const err = e as Error;
            console.log('error in catch postLeadRejection', err);
            newrelic?.noticeError?.(err);
          }
        }
      }

      if (errorArray.length) {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('text.summaryModalUpdateFailure', {
              message: errorArray.join(','),
            }),
            status: CONSTANTS.snackBarConfig.type.error,
          })
        );
      } else {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('text.summaryModalUpdateSuccessful'),
            status: CONSTANTS.snackBarConfig.type.success,
          })
        );
      }

      setLoading(false);
      dispatch(hideModal(CONSTANTS.ModalConfig.leadSummaryCallModal));
    });
  };

  return [handleFormSubmit as any];
}
