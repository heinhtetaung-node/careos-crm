import React, { useState, useEffect } from 'react';

import { FileDropType } from './types';

import FileDrop from '../FileDrop';
import { AddCircleIcon } from '@alphafounders/icons';

interface FileDropListProps {
  maxFileDrop: number;
  handleFileChange: (files: FileDropType) => void;
  error?: string;
}

function FileDropList({
  maxFileDrop,
  handleFileChange,
  error,
}: FileDropListProps) {
  const [files, setFiles] = useState<FileDropType>({});

  useEffect(() => {
    if (files) {
      handleFileChange(files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function handleFileRemove(name: string) {
    const newFiles = { ...files };
    delete newFiles[name];
    setFiles(newFiles);
  }

  const displayAddFileDrop = Object.keys(files).length < maxFileDrop;

  return (
    <>
      <div data-testid="prepopulated-one">
        {Object.entries(files).map(([key, value]) => (
          <FileDrop
            key={key}
            className="p-2"
            headIcon={<AddCircleIcon className="text-primary" />}
            onFileDrop={() => undefined}
            files={[value]}
            onFileRemove={() => handleFileRemove(key)}
          />
        ))}
      </div>
      <div data-testid="new-one">
        {displayAddFileDrop && (
          <FileDrop
            className="p-2"
            files={[]}
            headIcon={<AddCircleIcon className="text-primary" />}
            onFileDrop={(filesData) => {
              setFiles({
                ...files,
                [filesData[0].name]: filesData[0],
              });
            }}
            onFileRemove={() => undefined}
            error={error}
          />
        )}
      </div>
    </>
  );
}

export default FileDropList;
