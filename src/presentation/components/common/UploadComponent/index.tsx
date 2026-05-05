import React, { ChangeEvent, useRef } from 'react';
import { Button } from '@alphafounders/ui';

import { AddCircleIcon, TrashBinIcon } from '@alphafounders/icons';
import useSnackbar from 'utils/snackbar';
import { getString } from 'presentation/theme/localization';
import clsx from 'clsx';

type Slip = {
  display_name: string;
  content_type: string;
  size: number;
  value: string;
  originalFile: File;
};

type UploadComponentProps = Readonly<{
  slip?: Slip;
  setSlip: (slip: Slip) => void;
  title?: string;
  error?: boolean;
  openFile?: () => void;
  deleteFile?: (fileName: string) => void;
}>;

export default function UploadComponent({
  slip,
  setSlip,
  title,
  error,
  openFile,
  deleteFile,
}: UploadComponentProps) {
  const fileRef: any = useRef(null);
  const { showErrorSnackbar } = useSnackbar();
  const handleFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (slip?.display_name?.startsWith('documents')) {
      setSlip({
        display_name: '',
        content_type: '',
        size: 0,
        value: '',
        originalFile: new File([], ''),
      });
      deleteFile?.(slip?.display_name);
      e.preventDefault();
    } else {
      fileRef?.current?.click?.();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target as HTMLInputElement;
    if (!file.files) {
      return;
    }
    const selectedFile = file.files[0];
    const { name, type, size } = selectedFile;
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/JPG',
      'image/JPEG',
      'image/PNG',
      'application/pdf',
    ];
    if (size > 5242880 || !supportedTypes.includes(type)) {
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: getString('errors.nolargerThan5Mb'),
        })
      );
      return;
    }
    if (selectedFile) {
      setSlip({
        display_name: name,
        content_type: type,
        size,
        value: file.value,
        originalFile: selectedFile,
      });
    }
  };

  return (
    <div
      data-testid="file-upload-container"
      className={clsx([
        'border border-solid rounded-lg flex items-center justify-start gap-3 py-3 mt-3 hover:border-primary ',
        error ? 'border-red-500' : 'border-[#e9edf5]',
      ])}
    >
      <Button
        className="bg-white mx-3 drop-shadow-sm"
        dataTestId="file-upload-button"
        onClick={handleFile}
        text=""
        icon={
          slip?.display_name ? (
            <TrashBinIcon fillColor="red" />
          ) : (
            <AddCircleIcon fillColor="#005098" />
          )
        }
      />
      {slip?.display_name ? (
        <div className="flex flex-col items-start justify-between">
          <button
            type="button"
            className="max-w-80 text-left mb-2 text-lg truncate cursor-pointer bg-transparent border-none p-0"
            onClick={
              slip.display_name?.startsWith('documents') ? openFile : undefined
            }
          >
            {!slip?.display_name?.startsWith('documents')
              ? slip.display_name
              : slip.content_type}
          </button>
          <div className="max-w-80 text-left m-0 text-lightgray text-sm truncate">
            {!slip?.display_name?.startsWith('documents')
              ? slip.content_type
              : ''}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-between">
          <p className="w-full text-md m-0 text-left">
            {title ?? getString('printingAndShippingStatus.docUpload')}
          </p>
          <p className="w-full text-xs text-lightgray m-0">
            {getString('text.dragAndDropFile')}{' '}
            <button
              type="button"
              className="text-primary cursor-pointer bg-transparent border-none p-0"
              data-testid="chooseFileBtn"
              onClick={handleFile}
              tabIndex={0}
            >
              {getString('text.chooseFile')}
            </button>
          </p>
        </div>
      )}
      <input
        data-testid="doc-file"
        type="file"
        value={slip?.value}
        className="hidden"
        ref={fileRef}
        onChange={handleFileChange}
        accept=".jpg, .jpeg, .png, .pdf"
      />
    </div>
  );
}
