import React, { useState, useRef } from 'react';
import { DocumentFile } from '../helper';
import { Fab as MuiButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useDispatch } from 'react-redux';
import { UpdateTypes } from '../DocumentSection';
import { deleteDocument } from 'presentation/redux/actions/order/document';
import { ButtonStyleSheet } from '../document.styles';

const Button = ButtonStyleSheet(MuiButton);

interface ReplaceDocumentButtonProps {
  handleDeleteDocument: (label: string | undefined) => void;
  handleUpdateListFiles: (file: any, type: UpdateTypes) => void;
  field: DocumentFile;
  item?: string;
}

export default function ReplaceDocumentButton({
  field,
  handleDeleteDocument,
  handleUpdateListFiles,
  item,
}: ReplaceDocumentButtonProps) {
  const dispatch = useDispatch();

  const fileRef: any = useRef(null);
  const [selectedDocumentFile, setSelectedDocumentFile] =
    useState<DocumentFile | null>();

  const handleReplaceFile = (e: any) => {
    const file = e.target.files[0];
    const newFile = {
      file,
      fileName: file.name,
      documentType: selectedDocumentFile?.value || '',
      label: selectedDocumentFile?.label || '',
      ...(item ? { item } : {}),
    };
    handleUpdateListFiles(newFile, UpdateTypes.Upload);

    handleDeleteDocument(selectedDocumentFile?.label);
    dispatch(deleteDocument(selectedDocumentFile?.name));
  };

  const handleFile = (field: DocumentFile) => {
    setSelectedDocumentFile({
      label: field?.label,
      value: field?.value,
      name: field?.document?.name ?? '',
    });
    fileRef?.current?.click?.();
  };

  return (
    <>
      <input
        data-testid="doc-file"
        type="file"
        className="hidden"
        ref={fileRef}
        onChange={handleReplaceFile}
        accept=".jpg, .jpeg, .png, .gif, .pdf"
      />
      <Button size="small" onClick={() => handleFile(field)}>
        <AddCircleOutlineIcon fontSize="small" />
      </Button>
    </>
  );
}
