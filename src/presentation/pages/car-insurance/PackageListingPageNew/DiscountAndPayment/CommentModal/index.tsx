import { TickIcon } from '@alphafounders/icons';
import { Button, FileDropList, FileDropType } from '@alphafounders/ui';
import { makeStyles } from '@material-ui/core';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { mixed, object, string, array } from 'yup';

import Controls from 'presentation/components/controls/Control';
import CommonModal from 'presentation/components/modal/CommonModal';
import { getString } from 'presentation/theme/localization';

const useStyle = makeStyles((theme) => ({
  root: {
    '& label': {
      padding: '10px 10px',
    },
    '& textarea': {
      padding: '11px 16px',
      border: '1px solid',
      borderColor: theme.palette.grey[200],
      borderRadius: '10px',
      boxSizing: 'border-box',
    },
  },
}));

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string, files?: File[]) => Promise<unknown> | void;
  isDocumentOptional?: boolean;
  dataTestId?: string;
  disable?: boolean;
}

function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  isDocumentOptional,
  disable,
  dataTestId,
}: CommentModalProps) {
  const classes = useStyle();

  const [submitionSuccess, setSubmitionSuccess] = useState(false);

  const form = useFormik({
    initialValues: {
      description: '',
      file: undefined as undefined | File[],
    },
    validationSchema: object().shape({
      description: string().required(),
      file: isDocumentOptional
        ? mixed().notRequired()
        : array().required().min(1),
    }),
    onSubmit: async (values) => {
      const response: any = await onSubmit(values.description, values.file);
      if ('data' in response) {
        setSubmitionSuccess(true);
      }
    },
  });

  function handleFileChange(files: FileDropType) {
    form.setFieldTouched('file');
    form.setFieldValue('file', Object.values(files));
  }

  return (
    <CommonModal
      title={submitionSuccess ? undefined : getString('lead.comment')}
      titleCenter
      open={isOpen}
      handleCloseModal={onClose}
      dataTestId={dataTestId}
    >
      {submitionSuccess ? (
        <div className="p-6 flex items-center flex-col">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-200 my-6">
            <TickIcon />
          </div>
          <div className="font-bold text-lg">
            {getString('text.saveComplete')}
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit}>
          <div className="mt-5">
            <div className="text-left">{getString('text.description')}</div>
            <Controls.Input
              name="comment"
              placeholder={getString('lead.comment')}
              value={form.values.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                form.setFieldTouched('description');
                form.setFieldValue('description', e.target.value);
              }}
              rows={4}
              fixedLabel
              multiline
              className={classes.root}
              error={form.errors.description}
            />
          </div>
          {!isDocumentOptional && (
            <div className="mt-3">
              <div className="text-left">{getString('text.file')}</div>
              <div className="my-2">
                <FileDropList
                  maxFileDrop={5}
                  handleFileChange={(files) => handleFileChange(files)}
                  error={form.errors.file}
                />
              </div>
            </div>
          )}
          <div>
            <Button
              className="mx-auto px-10 py-4 my-5"
              text={getString('text.save')}
              type="submit"
              disabled={
                !form.isValid ||
                !(form.touched.description || form.touched.file) ||
                disable
              }
              isLoading={form.isSubmitting}
            />
          </div>
        </form>
      )}
    </CommonModal>
  );
}

export default CommentModal;
