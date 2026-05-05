import { FileSearchIcon } from '@alphafounders/icons';
import { Fab as MuiButton, Tooltip } from '@material-ui/core';
import { format } from 'date-fns';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import { ButtonStyleSheet } from './document.styles';
import { IUploadedDocument } from './DocumentSection';

type Document = {
  file: any;
  fileName: string;
  documentType: string;
};
interface Field {
  document: Document;
  isRequired: boolean;
  title: string;
  value: string;
  label: string;
}

export default function DocumentPreviewButton({
  field,
  handleOpenCloseDialog,
  uploadedDocs,
}: {
  field: Field;
  uploadedDocs: (IUploadedDocument | null)[];
  handleOpenCloseDialog: React.MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  const Button = ButtonStyleSheet(MuiButton);

  const getUploadDetails = (doc: Field) => {
    const policyDoc = uploadedDocs?.find(
      (i: IUploadedDocument | null) => i?.label.split('-')[0] === doc.label
    );
    if (policyDoc) {
      const updateDateTime = new Date(policyDoc?.updateTime ?? '');
      const owner = `${getString('text.by')} ${policyDoc?.createBy ?? '-'}`;
      const updateDate = format(updateDateTime, 'dd/MM/yyyy');
      const updateTime = format(updateDateTime, 'H:m');
      return `(${getString('text.uploadedOn')} ${updateDate} - ${updateTime}
          ${owner})`;
    }
    return '';
  };

  if (field.label === 'policyCertificate') {
    return (
      <Tooltip title={getUploadDetails(field)}>
        <Button size="small" onClick={handleOpenCloseDialog}>
          <FileSearchIcon fontSize="small" color="primary" />
        </Button>
      </Tooltip>
    );
  }
  return (
    <Button size="small" onClick={handleOpenCloseDialog}>
      <FileSearchIcon fontSize="small" color="primary" />
    </Button>
  );
}
