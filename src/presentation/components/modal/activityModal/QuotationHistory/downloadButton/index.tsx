import { DownloadFileIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

interface DownloadProps {
  document: string;
  onClick: (documentName: any) => Promise<any>;
}

const useStyles = makeStyles({
  downloadContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&& .MuiSvgIcon-root': {
      cursor: 'pointer',
    },
  },
});

function Download({ document, onClick }: DownloadProps) {
  const classes = useStyles();

  const handleDownload = () => {
    onClick(document);
  };

  return (
    <Button
      text=""
      className={clsx(
        classes.downloadContainer,
        'bg-primary rounded-[50%] p-2'
      )}
      onClick={handleDownload}
      dataTestId="download-button"
      icon={<DownloadFileIcon fillColor="white" />}
    />
  );
}

export default Download;
