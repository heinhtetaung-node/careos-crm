/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  FileSearchIcon,
  DocumentNotUploadedIcon,
  DownloadFileIcon,
} from '@alphafounders/icons';
import { TrashIcon } from '@alphafounders/icons';
import {
  Dialog,
  Typography,
  Grid,
  Box,
  Divider,
  useTheme,
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Close from '@material-ui/icons/Close';
import { useFlags } from 'flagsmith/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import { useDispatch } from 'react-redux';

import FeatureFlags from 'config/flagsmithConfig';
import CustomUploadFile from 'presentation/components/ActivityOrderSection/common/CustomUploadFile';
import { isValidFileType } from 'presentation/components/ActivityOrderSection/common/helper';
import {
  DocumentConfigType,
  DocumentType,
} from 'presentation/components/ActivityOrderSection/Document/config';
import { useFieldStyleSheet } from 'presentation/components/ActivityOrderSection/document.styles';
import {
  IPolicyDocType,
  IUploadedDocument,
  UpdateTypes,
  handleDownloadAllFiles,
} from 'presentation/components/ActivityOrderSection/DocumentSection';
import CommonModal from 'presentation/components/modal/CommonModal';
import DeleteDocumentModal from 'presentation/components/modal/DeleteDocumentModal';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { formatDoc, getDocByType } from 'shared/helper/documentHelper';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

import {
  findCurrentDocument,
  IPropsFileBrowseModal,
  DOCUMENT_FIELDS,
  POLICY_DOCUMENT_FIELDS,
  PreviewHeader,
  Button,
  DropFileZone,
} from '.';

import './index.scss';

interface IPropsShipmentFileBrowseModal extends IPropsFileBrowseModal {
  shipmentDocs?: DocumentConfigType[];
  policy?: string;
}

function ShipmentFileBrowseModal({
  openDialog,
  handleCloseDialog,
  label = '',
  fileLink = '',
  documents,
  listFiles = [],
  handleUpdateListFiles = () => null,
  handleDeleteDocument = () => null,
  isDisabled = false,
  disabledFileDeleted = false,
  disabledFileUpload = false,
  shipmentDocs = [],
  policy = '',
}: IPropsShipmentFileBrowseModal) {
  const [currentFile, setCurrentFile] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentDocs, setCurrentDocs] = useState<(IUploadedDocument | null)[]>(
    []
  );

  const theme = useTheme();
  const fieldClasses = useFieldStyleSheet();
  const dispatch = useDispatch();

  useEffect(() => {
    if (documents.length) {
      const allowedDocs: any[] = [];
      documents.forEach((i: any) => {
        const item: any = shipmentDocs.find((j) => j?.value === i.type);
        if (item) {
          allowedDocs.push({
            ...item,
            isRequired: i.required,
          });
        }
      });
      setCurrentDocs(allowedDocs);
    }
  }, [documents]);

  const getFieldFrmPolicyDocsByLbl = useCallback(
    (field: POLICY_DOCUMENT_FIELDS) => {
      const currentField = shipmentDocs.filter(
        (doc: IPolicyDocType) => doc?.label === currentFile
      )[0];
      if (!currentField) return 'Other';
      return currentField[field];
    },
    [currentFile]
  );

  const getDeleteDocLabel = useCallback(
    (field: POLICY_DOCUMENT_FIELDS) => {
      const currentField = shipmentDocs.filter(
        (doc: IPolicyDocType) => doc.label === selectedFile
      )[0];
      if (!currentField) return 'Other';
      return currentField[field];
    },
    [currentFile, selectedFile]
  );

  const getSelectedDocumentByLabel = () => {
    const [labelOrOther, other] = currentFile.split('_');
    return (documents || []).filter((doc: any) => {
      if (labelOrOther === 'other') return other === doc.label;
      return currentFile === doc?.label?.split('-')[0];
    })[0];
  };

  const getFieldFromDocsByLbl = (field: DOCUMENT_FIELDS) => {
    const currentUploadedDoc = getSelectedDocumentByLabel();
    if (!currentUploadedDoc) return '';
    return currentUploadedDoc[field];
  };

  const getTypeFromDocsByLbl = () => {
    const currentUploadedDoc = getSelectedDocumentByLabel();
    if (!currentUploadedDoc) return '';

    const nameFile =
      currentUploadedDoc.label.split('-')[
        currentUploadedDoc.label.split('-').length - 1
      ];
    return nameFile.split('.')[nameFile.split('.').length - 1];
  };

  const handleOpenCloseModal = (file?: string) => {
    setOpenDeleteModal(!openDeleteModal);
    if (file) {
      setSelectedFile(file);
    }
  };

  const onDeleteDocument = () => {
    const [labelOrOther, other] = selectedFile.split('_');
    const fileToDelete = (documents || []).filter((doc: any) => {
      if (labelOrOther === 'other') return other === doc.label;
      return selectedFile === doc.label.split('-')[0];
    })[0];
    if (fileToDelete) {
      handleDeleteDocument(fileToDelete[DOCUMENT_FIELDS.LABEL]);
    }
    handleOpenCloseModal();
  };

  const onDrop = useCallback(
    (acceptedFiles: any[]) => {
      acceptedFiles.forEach((file: any) => {
        const newFileUpload = {
          file,
          fileName: file.name,
          documentType: getFieldFrmPolicyDocsByLbl(
            POLICY_DOCUMENT_FIELDS.VALUE
          ),
          label: getFieldFrmPolicyDocsByLbl(POLICY_DOCUMENT_FIELDS.LABEL),
          item: policy ?? null,
        };
        if (!isValidFileType(file.type)) {
          dispatch(
            showSnackBar({
              isOpen: true,
              message: getString('errorMessage.unsupportedFile'),
              status: 'error',
            })
          );
          return;
        }
        handleUpdateListFiles(newFileUpload, UpdateTypes.Upload);
      });
    },
    [handleUpdateListFiles, getFieldFrmPolicyDocsByLbl, dispatch]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    setCurrentFile(label);
  }, [label, fileLink, openDialog]);

  useEffect(() => {
    const lastUploadedFile = listFiles[listFiles.length - 1];
    if (!lastUploadedFile) return;
    if (lastUploadedFile.documentType === DocumentType.DOCUMENT_TYPE_OTHERS)
      setCurrentFile(
        `other_${lastUploadedFile.label}-${lastUploadedFile.fileName}`
      );
  }, [listFiles]);

  const handleChangeCurrentFile = (document: string) => () => {
    setCurrentFile(document);
  };

  const handleDownloadDocument = () => {
    const documentID = getFieldFromDocsByLbl(DOCUMENT_FIELDS.DOCUMENT);
    if (documentID) downloadFileFromBlobURL(documentID);
  };

  const mapDocumentToPolicyDocTypes = (docs: IPolicyDocType[]) =>
    docs.map((doc: IPolicyDocType) => ({
      ...doc,
      document: getDocByType({
        type: doc?.value,
        label: doc?.label,
        documents,
      }),
    }));

  const getDownloadDocuments = () =>
    mapDocumentToPolicyDocTypes(shipmentDocs).filter(
      (field: any) => !!field.document
    );

  const renderPreviewFile = () => {
    const endpoint = `${
      process.env.VITE_API_ENDPOINT
    }/api/document/v1alpha1/${getFieldFromDocsByLbl(
      DOCUMENT_FIELDS.DOCUMENT
    )}:file`;
    const ImagePreview = (
      <div
        className="relative w-full h-full overflow-hidden"
        data-testid="preview-image"
      >
        <ReactPanZoom image={endpoint} />
      </div>
    );

    return getTypeFromDocsByLbl() === 'pdf' ? (
      <embed src={endpoint} width="90%" height="100%" />
    ) : (
      ImagePreview
    );
  };

  return (
    <Dialog scroll="body" open={openDialog} className="file-browser-modal-wrap">
      <div
        data-testid="shipment-file-browse-modal"
        className="file-browser-modal-override"
      >
        <div className="modal-button-close no-background">
          <div
            role="button"
            data-testid="file-browse-modal-close-btn"
            onClick={() => handleCloseDialog()}
            onKeyDown={() => null}
            tabIndex={0}
            className="close-btn"
          >
            <Close />
          </div>
        </div>
        <PreviewHeader>View document</PreviewHeader>
        <Box width="80vw" height="100%" p={7}>
          <Grid container item direction="row" spacing={10}>
            <Grid item xs={12} lg={8}>
              {!getFieldFromDocsByLbl(DOCUMENT_FIELDS.DOCUMENT)
                ? (() => {
                    if (disabledFileUpload) {
                      return (
                        <Box
                          height="545px"
                          width="100%"
                          borderRadius={theme.spacing() + 3}
                          bgcolor={theme.palette.grey[200]}
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Box textAlign="center">
                            <DocumentNotUploadedIcon fontSize="small" />
                            <Box
                              display="block"
                              component="span"
                              color={theme.palette.grey[400]}
                            >
                              {getString('qcDetail.noFileUploaded')}
                            </Box>
                          </Box>
                        </Box>
                      );
                    }

                    return (
                      <Box
                        height="100%"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <DropFileZone {...getRootProps()}>
                          <input
                            data-testid="drop-input"
                            {...getInputProps()}
                          />
                          {getString('text.dragAndDropFile')}
                          <span className={fieldClasses.chooseFile}>
                            {' '}
                            {getString('text.chooseFile')}
                          </span>
                        </DropFileZone>
                      </Box>
                    );
                  })()
                : renderPreviewFile()}
            </Grid>
            <Grid item xs={12} lg={4}>
              <Typography variant="h4" className="document-type">
                {getFieldFrmPolicyDocsByLbl(POLICY_DOCUMENT_FIELDS.TITLE)}
              </Typography>
              <Box pt="20px">
                <Divider />
              </Box>
              <div className={fieldClasses.root}>
                <Button
                  size="small"
                  onClick={() => {
                    handleDownloadAllFiles(
                      currentDocs,
                      getDownloadDocuments,
                      formatDoc
                    );
                  }}
                >
                  <DownloadFileIcon fontSize="small" />
                </Button>
                <span className={fieldClasses.file}>
                  {getString('text.downloadFiles', {
                    count: currentDocs.length,
                  })}
                </span>
              </div>
              {mapDocumentToPolicyDocTypes(shipmentDocs).map((field: any) => (
                <CustomUploadFile
                  key={field.title}
                  title={field.title}
                  value={field.value}
                  handleUpdateListFiles={handleUpdateListFiles}
                  handleDeleteDocument={handleDeleteDocument}
                  listFiles={listFiles}
                  document={field.document}
                  label={field?.label || ''}
                  documents={currentDocs}
                >
                  {findCurrentDocument(currentDocs, field.label) ? (
                    <CustomUploadFile.AddButton>
                      <Button
                        onClick={handleChangeCurrentFile(field.label)}
                        size="small"
                        data-testid="preview-doc-btn"
                      >
                        <FileSearchIcon fontSize="small" color="primary" />
                      </Button>
                    </CustomUploadFile.AddButton>
                  ) : (
                    <CustomUploadFile.PreviewButton>
                      <Button
                        data-testid="preview-add-btn"
                        onClick={handleChangeCurrentFile(field.label)}
                        size="small"
                        disabled={isDisabled}
                      >
                        {disabledFileUpload ? (
                          <DocumentNotUploadedIcon fontSize="small" />
                        ) : (
                          <AddCircleOutlineIcon
                            fontSize="small"
                            color="primary"
                          />
                        )}
                      </Button>
                    </CustomUploadFile.PreviewButton>
                  )}
                  <CustomUploadFile.Content>
                    <CustomUploadFile.Title
                      className={
                        currentFile === field.label
                          ? fieldClasses.file
                          : fieldClasses.noFile
                      }
                    >
                      {field.title}
                      {field.isRequired && <span className="asterisk">*</span>}
                    </CustomUploadFile.Title>
                  </CustomUploadFile.Content>
                  {findCurrentDocument(currentDocs, field.label) && (
                    <CustomUploadFile.ActionButtons>
                      <Button onClick={handleDownloadDocument} size="small">
                        <DownloadFileIcon fontSize="small" />
                      </Button>
                      {!disabledFileDeleted && (
                        <Button
                          onClick={() => {
                            handleOpenCloseModal(field.label);
                          }}
                          size="small"
                          disabled={isDisabled}
                        >
                          <TrashIcon fontSize="small" color="primary" />
                        </Button>
                      )}
                    </CustomUploadFile.ActionButtons>
                  )}
                </CustomUploadFile>
              ))}
            </Grid>
          </Grid>
        </Box>

        <CommonModal
          title=""
          open={openDeleteModal}
          handleCloseModal={handleOpenCloseModal}
        >
          <DeleteDocumentModal
            handleOpenCloseModal={handleOpenCloseModal}
            handleRemoveDocument={onDeleteDocument}
            documentType={getDeleteDocLabel(POLICY_DOCUMENT_FIELDS.TITLE)}
          />
        </CommonModal>
      </div>
    </Dialog>
  );
}

export default ShipmentFileBrowseModal;
