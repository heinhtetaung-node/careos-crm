import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import type { Accept } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

import Button from 'common/Button';
import { FileCopyIcon, TrashBinIcon } from '@alphafounders/icons';

import DefaultSelectFileBody from './DefaultSelectFileBody';
import { decodeFileDropErrors } from './helper';

interface FileDropProps {
  headIcon?: React.ReactNode;
  selectFileBody?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  accept?: Accept;
  maxFiles?: number;
  error?: string;
  files?: File[];
  onFileDrop: (f: File[]) => Promise<unknown> | void;
  onFileRemove?: () => Promise<unknown> | void;
}

function FileDrop({
  headIcon,
  selectFileBody,
  disabled,
  accept,
  className,
  error,
  onFileDrop,
  onFileRemove,
  files,
  maxFiles = 1,
}: FileDropProps) {
  const [_files, setFiles] = useState<File[]>([]);

  const handleFileDrop = async (dropFiles: File[]) => {
    if (dropFiles.length) {
      try {
        await onFileDrop(dropFiles);
        if (files === undefined) {
          setFiles(dropFiles);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFileRemove = async () => {
    try {
      await onFileRemove?.();
      if (files === undefined) {
        setFiles([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const {
    getRootProps,
    getInputProps,
    open: openFileBrowser,
    fileRejections,
  } = useDropzone({
    onDrop: handleFileDrop,
    disabled,
    accept,
    maxFiles,
  });

  useEffect(() => {
    if (files) {
      setFiles(files);
    }
  }, [files]);

  return (
    <div
      className={clsx('p-3 rounded-xl border border-solid border-muted-light')}
    >
      <div className="flex justify-between items-center">
        <div
          className={clsx('flex grow items-center', className)}
          data-testid="drop-zone"
          {...getRootProps()}
        >
          <div>
            {headIcon && _files.length === 0 && (
              <Button
                className="p-1 bg-white border-0"
                onClick={openFileBrowser}
                text={headIcon}
              />
            )}
            {_files.length > 0 && (
              <div className="flex items-center justify-center mx-2 text-primary bg-muted-light w-7 h-7 rounded-full">
                <FileCopyIcon />
              </div>
            )}
          </div>
          <div className="w-full text-left">
            <input
              data-testid="drop-zone-input"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(getInputProps() as any)}
            />
            {selectFileBody ?? (
              <DefaultSelectFileBody fileName={_files[0]?.name} />
            )}
          </div>
        </div>
        {_files.length > 0 && (
          <div>
            <Button
              dataTestId="remove-file-btn"
              variant="secondary"
              text={<TrashBinIcon />}
              rounded
              className="border-0 p-1"
              onClick={handleFileRemove}
            />
          </div>
        )}
      </div>
      <div
        data-testid="drop-zone-errors"
        className="text-warning w-full whitespace-pre-wrap text-left text-[.7rem]"
      >
        {decodeFileDropErrors(fileRejections) || error}
      </div>
    </div>
  );
}

export default FileDrop;
