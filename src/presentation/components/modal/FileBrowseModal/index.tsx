/* eslint-disable jsx-a11y/control-has-associated-label */
import {
  FileSearchIcon,
  DocumentNotUploadedIcon,
  DownloadFileIcon,
} from '@alphafounders/icons';
import { TrashIcon } from '@alphafounders/icons';
import {
  Dialog as MuiDialog,
  Typography,
  Fab,
  Box,
  Divider,
  withStyles,
  useTheme,
  Paper as MuiPaper,
  PaperProps,
  DialogContent,
  CircularProgress,
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Close from '@material-ui/icons/Close';
import clsx from 'clsx';
import { useFlags } from 'flagsmith/react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Draggable from 'react-draggable';
import { useDropzone } from 'react-dropzone';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import FeatureFlags from 'config/flagsmithConfig';
import CustomUploadFile from 'presentation/components/ActivityOrderSection/common/CustomUploadFile';
import { isValidFileType } from 'presentation/components/ActivityOrderSection/common/helper';
import CustomFields from 'presentation/components/ActivityOrderSection/CustomFields';
import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import {
  useFieldStyleSheet,
  ButtonStyleSheet,
} from 'presentation/components/ActivityOrderSection/document.styles';
import {
  FilesDownload,
  IPolicyDocType,
  IUploadedDocument,
  CustomFieldsContext,
  UpdateTypes,
  handleDownloadAllFiles,
} from 'presentation/components/ActivityOrderSection/DocumentSection';
import {
  calculateUploadedDocumentsCount,
  getCustomerDocumentType,
} from 'presentation/components/ActivityOrderSection/helper';
import CommonModal from 'presentation/components/modal/CommonModal';
import DeleteDocumentModal from 'presentation/components/modal/DeleteDocumentModal';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { formatDoc, getDocByType } from 'shared/helper/documentHelper';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

import useCurrentFile from './useCurrentFile';
import { useGetDocumentDetailsQuery } from 'data/slices/documentUploadSlice';
import { PRODUCTS } from 'config/TypeFilter';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

export interface IPropsFileBrowseModal {
  isLoading?: boolean;
  type?: 'draggable' | 'default'; // decide what kind of paper component to use.
  openDialog: boolean;
  handleCloseDialog: () => void;
  label?: string;
  fileLink?: string;
  listFiles?: (FilesDownload | undefined)[];
  documents: (IUploadedDocument | null)[];
  handleUpdateListFiles?: (
    newFile: FilesDownload | undefined,
    typeUpdate: UpdateTypes
  ) => void;
  handleDeleteDocument?: (payload: string) => void;
  isDisabled?: boolean;
  disabledFileUpload?: boolean;
  disabledFileDeleted?: boolean;
  allowPayslipDocument?: boolean;
  allowBookBankDocument?: boolean;
  isOtherDocuments?: boolean;
}

export const DropFileZone = styled.div`
  cursor: pointer;
`;

export const StyledImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: 7px;
`;

export const Button = ButtonStyleSheet(Fab);

// remove after FileBrowseModal and ShipmentFileBrowseModal unify into one.
export const PreviewHeader = withStyles((theme) => ({
  root: {
    borderRadius: '16px 16px 0 0',
    fontWeight: 'bold',
    color: `${theme.palette.common.white}`,
    backgroundColor: `${theme.palette.common.sky}`,
    padding: `${theme.spacing() * 4}px 0`,
    textAlign: 'center',
  },
}))(Box);

const Dialog = withStyles((theme) => ({
  root: {
    '& .MuiDialog-paperScrollPaper': {
      maxHeight: '100%',
    },
  },
  paper: {
    overflowY: 'unset',
    maxWidth: '100%',
    borderRadius: `${theme.spacing() * 4}px`,
  },
}))(MuiDialog);

function DraggablePaperComponent(props: Readonly<PaperProps>) {
  return (
    <Draggable
      handle="#preview-header"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <MuiPaper {...props} />
    </Draggable>
  );
}

export function PreviewFile({
  document,
  docType,
  className = '',
  pdfClassName = '',
  imgClassName = '',
  unknownFileType,
}: Readonly<{
  document: string;
  docType: string;
  className?: string;
  pdfClassName?: string;
  imgClassName?: string;
  unknownFileType?: boolean;
}>) {
  const [selDocType, setSelDocType] = useState<string>();

  const endpoint = `${process.env.VITE_API_ENDPOINT}/api/document/v1alpha1/${document}`;

  const { data: documentDetail } = useGetDocumentDetailsQuery(document, {
    skip: !document || !unknownFileType,
  });

  useEffect(() => {
    if (unknownFileType) {
      if (documentDetail?.contentType === 'application/pdf') {
        setSelDocType('pdf');
      } else {
        setSelDocType('jpg');
      }
    }
  }, [documentDetail]);

  if ((selDocType || docType) === 'pdf') {
    return (
      <embed
        data-testid="pdf-preview"
        src={`${endpoint}:file`}
        className={clsx('w-[100%] h-[350px]', className, pdfClassName)}
      />
    );
  }
  return (
    <div
      className={clsx(
        'relative w-full h-full overflow-hidden',
        className,
        imgClassName
      )}
      data-testid="image-preview"
    >
      <ReactPanZoom image={`${endpoint}:file`} />
    </div>
  );
}

const paperComponentLookup = {
  draggable: DraggablePaperComponent,
  default: MuiPaper,
};

export enum POLICY_DOCUMENT_FIELDS {
  TITLE = 'title',
  VALUE = 'value',
  LABEL = 'label',
}

export enum DOCUMENT_FIELDS {
  LABEL = 'label',
  DOCUMENT = 'document',
}

export const findCurrentDocument = (
  docs: (IUploadedDocument | null)[],
  label: string
) => Boolean(docs?.find((doc) => doc?.label.split('-')[0] === label));

function FileBrowseModal({
  type = 'default',
  openDialog,
  handleCloseDialog,
  label: selectedLabel = '',
  fileLink = '',
  documents,
  listFiles = [],
  handleUpdateListFiles = () => null,
  handleDeleteDocument = () => null,
  isDisabled = false,
  disabledFileDeleted = false,
  disabledFileUpload = false,
  allowPayslipDocument = false,
  allowBookBankDocument = false,
  isOtherDocuments = false,
  isLoading = false,
}: Readonly<IPropsFileBrowseModal>) {
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const payslipFeatureEnabled = false;

  const bookBankFeatureEnabled = false;

  const showPayslipDocument = allowPayslipDocument && payslipFeatureEnabled;
  const showBookBankDocument = allowBookBankDocument && bookBankFeatureEnabled;

  const excludeDocTypes: DocumentType[] = [];

  if (!showPayslipDocument)
    excludeDocTypes.push(DocumentType.DOCUMENT_TYPE_PAYMENT_SLIP);

  if (!showBookBankDocument)
    excludeDocTypes.push(DocumentType.DOCUMENT_TYPE_BOOK_BANK);

  const modifiedDocTypes = getCustomerDocumentType(
    excludeDocTypes,
    globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE
  );

  const noOfUploadedDocuments = calculateUploadedDocumentsCount(
    documents,
    modifiedDocTypes
  );

  const [
    { docType, currentFile: { document = '', label = '' } = {} },
    setCurrentFile,
    getFieldFromPolicyDocTypeByLabel,
  ] = useCurrentFile({
    label: selectedLabel,
    documents: documents as IUploadedDocument[],
  });

  const isDraggable = type === 'draggable';
  const PaperComponent = paperComponentLookup[type];

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState('');

  const theme = useTheme();
  const fieldClasses = useFieldStyleSheet();
  const scroll = isDraggable ? 'paper' : 'body';
  const wrapperClasses = isDraggable
    ? 'flex-col h-[500px] w-[40vw]'
    : 'xl:flex-row h-[100%] w-[80vw]';

  const pdfHeight = docType === 'pdf' ? 'min-h-[650px]' : '';
  const previewColClasses = clsx(
    isDraggable ? 'flex-1' : `w-[100%] xl:basis-8/12 ${pdfHeight}`
  );

  const docUploadColClasses = clsx(!isDraggable && 'w-[100%] xl:basis-4/12');

  const dispatch = useDispatch();
  const CUSTOM_FIELDS_CONTEXT = useMemo(
    () => ({
      listFiles,
      disabledFileUpload,
      disabledFileDeleted,
      handleUpdateListFiles,
      handleDeleteDocument,
      handleCustomFieldPreview: (doc: Record<string, string>) => {
        setCurrentFile(doc.fileName);
      },
    }),
    [
      listFiles,
      disabledFileUpload,
      disabledFileDeleted,
      handleUpdateListFiles,
      handleDeleteDocument,
      setCurrentFile,
    ]
  );

  const handleOpenCloseModal = (file?: string) => {
    setOpenDeleteModal(!openDeleteModal);
    if (file) setCurrentFile(file);
  };

  const onDeleteDocument = () => {
    if (label) handleDeleteDocument(label);
    handleOpenCloseModal();
  };

  const onDrop = useCallback(
    (acceptedFiles: any[]) => {
      acceptedFiles.forEach((file: any) => {
        const newFileUpload = {
          file,
          fileName: file.name,
          documentType: getFieldFromPolicyDocTypeByLabel(
            POLICY_DOCUMENT_FIELDS.VALUE
          ),
          label: getFieldFromPolicyDocTypeByLabel(POLICY_DOCUMENT_FIELDS.LABEL),
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
    [handleUpdateListFiles, getFieldFromPolicyDocTypeByLabel, dispatch]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    setCurrentDocument(document);
  }, [document]);

  useEffect(() => {
    setCurrentFile(selectedLabel);
  }, [selectedLabel, fileLink, openDialog, setCurrentFile]);

  useEffect(() => {
    const lastUploadedFile = listFiles[listFiles.length - 1];
    if (!lastUploadedFile) return;
    if (lastUploadedFile.documentType === DocumentType.DOCUMENT_TYPE_OTHERS)
      setCurrentFile(lastUploadedFile.label);
  }, [listFiles, setCurrentFile]);

  const handleChangeCurrentFile = useCallback((_document: string) => {
    setCurrentFile(_document);
    setCurrentDocument(_document);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadDocument = () => {
    if (document) downloadFileFromBlobURL(document);
  };

  const mapDocumentToDocTypes = (docs: IPolicyDocType[]) =>
    docs.map((doc: IPolicyDocType) => ({
      ...doc,
      document: getDocByType({
        type: doc?.value,
        label: doc?.label,
        documents,
      }),
    }));

  const getDownloadDocuments = () =>
    mapDocumentToDocTypes(modifiedDocTypes).filter(
      (field: any) => !!field.document
    );

  return (
    <Dialog
      PaperComponent={PaperComponent}
      disableScrollLock={isDraggable}
      scroll={scroll}
      open={openDialog}
    >
      <div data-testid="file-browse-modal" className="h-full">
        <div className="bg-white">
          <div
            role="button"
            data-testid="file-browse-modal-close-btn"
            onClick={() => handleCloseDialog()}
            onKeyDown={() => null}
            tabIndex={0}
            className="flex items-center justify-center absolute cursor-pointer -top-5 -right-5 bg-[#f8f6f6] text-[#005098] w-10 h-10 rounded-full z-[3] overflow-hidden shadow-[2px 3px 14px 0 rgba(74, 74, 74, 0.25)]"
          >
            <Close />
          </div>
        </div>
        <div
          className="rounded-t-2xl rounded-b-none text-white text-center font-bold bg-[#005098] py-4 text-sm"
          id="preview-header"
        >
          {getString('fileBrowseModal.viewDocument')}
        </div>
        <DialogContent className="p-7" dividers>
          {isLoading && documents.length === 0 ? (
            <div
              className="w-[40em] h-[20em] flex flex-col items-center justify-around"
              data-testid="file-loading"
            >
              <CircularProgress />
            </div>
          ) : (
            <div
              className={clsx(
                'flex flex-col gap-y-10 xl:gap-x-10',
                wrapperClasses
              )}
            >
              <div className={previewColClasses}>
                {!document ? (
                  (() => {
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
                        className={clsx(
                          'min-h-[350px]',
                          isDraggable ? 'xl:h-[350px]' : 'xl:h-[100%]'
                        )}
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
                ) : (
                  <PreviewFile
                    document={currentDocument}
                    docType={docType}
                    className={clsx(
                      isDraggable ? 'xl:h-[500px]' : 'xl:h-[100%]'
                    )}
                  />
                )}
              </div>
              <div className={docUploadColClasses}>
                <Typography variant="h4" className="document-type">
                  {getFieldFromPolicyDocTypeByLabel(
                    POLICY_DOCUMENT_FIELDS.TITLE
                  )}
                </Typography>
                <Box pt="20px">
                  <Divider />
                </Box>
                <div className={fieldClasses.root}>
                  <Button
                    size="small"
                    onClick={() => {
                      handleDownloadAllFiles(
                        documents,
                        getDownloadDocuments,
                        formatDoc
                      );
                    }}
                  >
                    <DownloadFileIcon fontSize="small" />
                  </Button>
                  <span className={fieldClasses.file}>
                    {getString('text.downloadFiles', {
                      count: noOfUploadedDocuments,
                    })}
                  </span>
                </div>
                {!isOtherDocuments &&
                  mapDocumentToDocTypes(modifiedDocTypes).map((field: any) => (
                    <CustomUploadFile
                      key={field.title}
                      title={field.title}
                      value={field.value}
                      handleUpdateListFiles={handleUpdateListFiles}
                      handleDeleteDocument={handleDeleteDocument}
                      listFiles={listFiles}
                      document={field.document}
                      label={field?.label || ''}
                      documents={documents}
                    >
                      {findCurrentDocument(documents, field.label) ? (
                        <CustomUploadFile.AddButton>
                          <Button
                            onClick={() => handleChangeCurrentFile(field.label)}
                            size="small"
                          >
                            <FileSearchIcon fontSize="small" color="primary" />
                          </Button>
                        </CustomUploadFile.AddButton>
                      ) : (
                        <CustomUploadFile.PreviewButton>
                          <Button
                            data-testid="preview-add-btn"
                            onClick={() => handleChangeCurrentFile(field.label)}
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
                            label === field.label
                              ? fieldClasses.file
                              : fieldClasses.noFile
                          }
                        >
                          {field.title}
                          {field.isRequired && (
                            <span className="asterisk">*</span>
                          )}
                        </CustomUploadFile.Title>
                      </CustomUploadFile.Content>
                      {findCurrentDocument(documents, field.label) && (
                        <CustomUploadFile.ActionButtons>
                          <Button
                            data-testid="download-btn"
                            onClick={handleDownloadDocument}
                            size="small"
                          >
                            <DownloadFileIcon fontSize="small" />
                          </Button>
                          {!disabledFileDeleted && (
                            <Button
                              data-testid="delete-btn"
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
                <CustomFieldsContext.Provider value={CUSTOM_FIELDS_CONTEXT}>
                  <CustomFields
                    documents={documents}
                    isDisabled={isDisabled}
                    handleChangeCurrentFile={handleChangeCurrentFile}
                  />
                </CustomFieldsContext.Provider>
              </div>
            </div>
          )}
        </DialogContent>

        <CommonModal
          title=""
          open={openDeleteModal}
          handleCloseModal={handleOpenCloseModal}
        >
          <DeleteDocumentModal
            handleOpenCloseModal={handleOpenCloseModal}
            handleRemoveDocument={onDeleteDocument}
            documentType={getFieldFromPolicyDocTypeByLabel(
              POLICY_DOCUMENT_FIELDS.TITLE
            )}
          />
        </CommonModal>
      </div>
    </Dialog>
  );
}

export default FileBrowseModal;
