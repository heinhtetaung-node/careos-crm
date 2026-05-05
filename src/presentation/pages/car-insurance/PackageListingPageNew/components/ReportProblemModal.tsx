import React, { useEffect, useRef, useState } from 'react';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from 'presentation/redux/reducers';
import { useNavigate } from 'react-router-dom';
import { Button } from '@material-ui/core';
import Dialog from 'presentation/components/common/Dialog';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import { getString } from 'presentation/theme/localization';
import { useAddCommentMutation } from 'data/slices/leadDetails/commentsSlice';
import useSnackbar from 'utils/snackbar';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

type ReportProblemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
};

function ReportProblemModal({
  isOpen,
  onClose,
  leadId,
}: Readonly<ReportProblemModalProps>) {
  const selectedInsurersWithPackages = useTypedSelector(
    (state) => state.insurerWithPackages?.selectedInsurersWithPackages ?? []
  );

  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const [addComment] = useAddCommentMutation();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const handleSubmitRequestCustomPackage = async (
    commentText: string,
    createPackage: boolean
  ) => {
    try {
      await addComment({
        text: commentText,
        leadId: `leads/${leadId}`,
      }).unwrap();

      showSuccessSnackbar(getString('text.reasonAddedSuccessfully'));

      if (!createPackage) {
        onClose();
        return;
      }

      navigate(`/leads/${leadId}/custom-quote`, {
        state: { selectedInsurersWithPackages, fromPackages: true },
      });
    } catch (error) {
      console.error('Failed to create comment:', error);
      showErrorSnackbar(
        getString('errorMessage.failedToAddReason') || 'Failed to add reason'
      );
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const defaultText = 'เหตุผล: ';

    if (navigator.clipboard?.readText) {
      navigator.clipboard
        .readText()
        .then((text) => {
          setValue(`${text}\n${defaultText}`);
        })
        .catch(() => {
          setValue(defaultText);
        });
    } else {
      setValue(defaultText);
    }

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    });
  }, [isOpen]);

  return (
    <Dialog
      title={getString('carFilter.reportProblem')}
      open={isOpen}
      handleToggle={onClose}
      content={
        <div>
          <div className="p-4">
            <CommonTextField
              label={getString('qc.comment')}
              value={value}
              fullWidth
              required
              multiline
              placeholder={getString('qc.typeHere')}
              minRows={6}
              onChange={(e) => setValue(e.target.value)}
              inputRef={textareaRef}
            />
          </div>

          <div className="p-4 justify-around flex">
            <Button variant="outlined" color="inherit" onClick={onClose}>
              {getString('text.cancelButton')}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmitRequestCustomPackage(value, false)}
              disabled={!value.trim()}
            >
              {getString('submissionStatus.submit')}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmitRequestCustomPackage(value, true)}
              disabled={!value.trim()}
            >
              {getString('text.submitAndCreate')}
            </Button>
          </div>
        </div>
      }
    />
  );
}

export default ReportProblemModal;
