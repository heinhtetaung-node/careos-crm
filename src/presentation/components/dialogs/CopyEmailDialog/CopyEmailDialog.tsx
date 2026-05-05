import React from 'react';
import { useDispatch } from 'react-redux';
import { useCopyToClipboard } from 'usehooks-ts';

import { Button } from '@alphafounders/ui';
import Dialog from 'presentation/components/common/Dialog';
import { EmailIcon } from 'presentation/components/icons';
import Spinner from 'presentation/components/Spinner';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

interface EmailContent {
  emailAddress: string;
  emailCcs: string[];
  emailSubject: string;
  emailBody: string;
}

interface CopyEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  data: EmailContent | null;
  isError: boolean;
}

export const CopyEmailDialog: React.FC<CopyEmailDialogProps> = ({
  isOpen,
  onClose,
  isLoading,
  data,
  isError,
}) => {
  const dispatch = useDispatch();
  const [_, copy] = useCopyToClipboard();

  const showAlert = (
    snackBarType: string,
    messageText: string,
    isNotClose = false
  ) => {
    dispatch(
      showSnackBar({
        isOpen: true,
        message: messageText,
        status: snackBarType,
        isNotClose,
      })
    );
  };

  const handleCopyEmail = () => {
    if (data?.emailAddress) {
      copy(data.emailAddress);
      showAlert(
        CONSTANTS.snackBarConfig.type.success,
        getString('copyEmailDialog.copyEmailSuccess')
      );
    }
  };

  const handleCopySubject = () => {
    if (data?.emailSubject) {
      copy(data.emailSubject);
      showAlert(
        CONSTANTS.snackBarConfig.type.success,
        getString('copyEmailDialog.copySubjectSuccess')
      );
    }
  };

  const handleCopyBody = () => {
    if (data?.emailBody) {
      copy(data.emailBody);
      showAlert(
        CONSTANTS.snackBarConfig.type.success,
        getString('copyEmailDialog.copyBodySuccess')
      );
    }
  };

  const renderActionButtons = () => {
    if (!data || isError) return null;

    const { emailAddress, emailCcs, emailSubject, emailBody } = data;
    const ccsParam =
      emailCcs && emailCcs.length > 0
        ? `&cc=${encodeURIComponent(emailCcs.join(','))}`
        : '';
    const gmailLink = `https://mail.google.com/mail/u/0/?fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}${ccsParam}&tf=cm`;

    return (
      <div className="flex flex-wrap justify-end gap-3 w-full mt-4">
        <Button
          variant="secondary"
          text={getString('copyEmailDialog.copyEmailAddress')}
          onClick={handleCopyEmail}
          className="h-10 px-4"
        />
        <Button
          variant="secondary"
          text={getString('copyEmailDialog.copySubject')}
          onClick={handleCopySubject}
          className="h-10 px-4"
        />
        <Button
          variant="secondary"
          text={getString('copyEmailDialog.copyBody')}
          onClick={handleCopyBody}
          className="h-10 px-4"
        />
        <a href={gmailLink} target="_blank" rel="noopener noreferrer">
          <Button
            variant="primary"
            text={getString('copyEmailDialog.openInApp')}
            className="h-10 px-4"
          />
        </a>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner />
          <p className="mt-4 text-gray-600">
            {getString('text.loadingContent', {
              defaultValue: 'Loading email content...',
            })}
          </p>
        </div>
      );
    }

    if (isError && !data) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-red-500 mb-4">
            <EmailIcon />
          </div>
          <p className="font-bold text-lg text-red-600">
            {getString('text.failedToLoadContent')}
          </p>
        </div>
      );
    }

    if (data) {
      return (
        <div className="flex flex-col text-left w-full max-w-2xl">
          <div className="flex items-center gap-3">
            <EmailIcon />
            <h2 className="text-xl font-semibold text-gray-800">
              {getString('copyEmailDialog.title')}
            </h2>
          </div>

          <div>
            <p className="font-semibold text-gray-600">
              {getString('text.emailTo', { defaultValue: 'Email To' })}:
            </p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded border">
              {data.emailAddress}
            </p>
          </div>

          {data.emailCcs && data.emailCcs.length > 0 && (
            <div>
              <p className="font-semibold text-gray-600 mb-2">
                {getString('text.emailCCs', { defaultValue: 'CC' })}:
              </p>
              <p className="text-gray-800 bg-gray-50 p-3 rounded border">
                {data.emailCcs.join(', ')}
              </p>
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-600 mb-2">
              {getString('text.subject')}:
            </p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded border">
              {data.emailSubject}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-600 mb-2">
              {getString('text.emailBody', { defaultValue: 'Email Body' })}:
            </p>
            <div className="border-slate-300 rounded-lg border p-4 bg-slate-50 whitespace-pre-wrap break-words text-sm max-h-96 overflow-y-auto">
              {data.emailBody}
            </div>
          </div>

          {renderActionButtons()}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog
      open={isOpen}
      maxWidth="md"
      formId="copy-email-dialog"
      handleToggle={onClose}
      content={renderContent()}
    />
  );
};

export default CopyEmailDialog;
