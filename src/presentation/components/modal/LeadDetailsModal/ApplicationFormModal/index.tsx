import React, { useCallback, useEffect, useState } from 'react';
import { PreviewFile } from '../../FileBrowseModal';
import Controls from 'presentation/components/controls/Control';
import { useSelector } from 'react-redux';
import MutationResponseDialog from 'presentation/components/common/StatusDialog';
import CopyButton from 'presentation/components/common/PaymentDialogActionButtons/CopyButton';
import { SuccessIcon } from '@alphafounders/icons';
import { Lead } from 'shared/types/lead';
import { LoadingSpinner } from '@alphafounders/ui';
import {
  useGetApplicationFormMutation,
  useSendApplicationFormMutation,
} from 'data/slices/gffSlice';
import useSnackbar from 'utils/snackbar';
import { getString } from 'presentation/theme/localization';
import { addLink } from 'presentation/components/common/PaymentDialogActionButtons/helper';

export default function ApplicationFormModal({ handleOnClose }: any) {
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const { showErrorSnackbar } = useSnackbar();

  const leadData: Lead = useSelector(
    (state: any) => state.leadsDetailReducer.lead.payload
  );

  const [getApplicationForm, result] = useGetApplicationFormMutation();

  const [sendApplicationForm, resultSend] = useSendApplicationFormMutation();

  const handleGenerateApplicationForm = useCallback(() => {
    getApplicationForm({
      leadId: leadData.name,
    });
  }, [getApplicationForm, leadData.name]);

  useEffect(() => {
    handleGenerateApplicationForm();
  }, [handleGenerateApplicationForm]);

  useEffect(() => {
    if (resultSend.isSuccess) {
      setShowResponseDialog(true);
    }
    if (resultSend.isError) {
      showErrorSnackbar('Failed to send SMS. Please try again.');
    }
  }, [resultSend.isSuccess, resultSend.isError, showErrorSnackbar]);

  const handleSendSmsToCustomer = () => {
    sendApplicationForm({
      leadId: leadData.name,
    });
  };

  if (result.isLoading) {
    return (
      <div className="h-[80vh] flex flex-col gap-4 py-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (result.isError) {
    return (
      <div className="h-[80vh] flex flex-col gap-4 py-6">
        <div className="">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-2xl font-bold text-red-500">
              {getString('text.error')}
            </div>
          </div>
        </div>
        <Controls.Button
          color="primary"
          variant="contained"
          className="uppercase"
          onClick={() => handleGenerateApplicationForm()}
        >
          {getString('text.tryAgain')}
        </Controls.Button>
      </div>
    );
  }

  if (result.isSuccess) {
    return (
      <div className="h-[80vh] flex flex-col gap-4 py-6">
        <PreviewFile
          document={result.data.document}
          docType="pdf"
          className="h-full"
        />
        <Controls.Button
          color="primary"
          variant="contained"
          className="uppercase"
          onClick={handleSendSmsToCustomer}
          disabled={resultSend.isLoading}
        >
          {getString('text.createAndSendToCustomer')}
        </Controls.Button>

        {/* <MutationResponseErrorDialog /> */}
        <MutationResponseDialog
          id="application-form-sms-response-modal"
          icon={<SuccessIcon fontSize="large" />}
          title={getString('text.applicationFormCreated')}
          isLoading={resultSend.isLoading}
          setIsOpen={() => {
            setShowResponseDialog(false);
            resultSend.reset();
            handleOnClose();
          }}
          isOpen={showResponseDialog}
          content={
            <div className="border-slate-300 border-radius-20 rounded-lg border-solid w-80 h-auto p-3 bg-slate-200 success-text whitespace-pre-wrap break-words text-left">
              {addLink(
                resultSend.data?.message || '',
                resultSend.data?.applicationFormLink || ''
              )}
            </div>
          }
          showCloseBtn
          actionButton={
            <CopyButton
              successMessage={resultSend.data?.message}
              successMessageAlert={getString('text.copyMessageSuccess')}
            />
          }
        />
      </div>
    );
  }
}
