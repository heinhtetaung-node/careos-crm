import _isFunction from 'lodash/isFunction';
import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  createContext,
  PropsWithChildren,
  useMemo,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { DocumentConfigType } from '../Document/config';
import CommonModal from 'presentation/components/modal/CommonModal';
import DeleteDocumentModal from 'presentation/components/modal/DeleteDocumentModal';
import FileBrowseModal from 'presentation/components/modal/FileBrowseModal';
import ShipmentFileBrowseModal from 'presentation/components/modal/FileBrowseModal/ShipmentFileBrowseModal';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

import { isValidFileType } from './helper';

import { useFieldStyleSheet } from '../document.styles';
import {
  FilesDownload,
  UpdateTypes,
  IUploadedDocument,
} from '../DocumentSection';

interface Props {
  title: string;
  value: string;
  handleUpdateListFiles: (
    newFile: FilesDownload | undefined,
    typeUpdate: UpdateTypes
  ) => void;
  listFiles: (FilesDownload | undefined)[];
  handleDeleteDocument: (payload: string) => void;
  document: FilesDownload | undefined;
  label: string;
  documents: (IUploadedDocument | null)[];
  isOtherFile?: boolean | undefined;
  isDisabled?: boolean;
  enablePreviewModalDraggable?: boolean;
  shipmentDocs?: DocumentConfigType[];
  item?: string;
  isPolicyDocSection?: boolean;
  allowPayslipDocument?: boolean;
  allowBookBankDocument?: boolean;
}

const CustomUploadFileContext = createContext({} as any);

function CustomUploadFile({
  title,
  value,
  handleUpdateListFiles,
  handleDeleteDocument,
  listFiles,
  document,
  label,
  documents,
  isOtherFile,
  children,
  isDisabled = false,
  shipmentDocs = [],
  item = '',
  isPolicyDocSection = false,
  enablePreviewModalDraggable = false,
  allowPayslipDocument = false,
  allowBookBankDocument = false,
}: PropsWithChildren<Props>) {
  const [fileName, setFileName] = useState('');
  const [fileURL, setFileURL] = useState('');
  const [fileCurrent, setFileCurrent] = useState<FilesDownload | undefined>();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const fieldClasses = useFieldStyleSheet();
  const dispatch = useDispatch();

  const { pathname } = useLocation();

  useEffect(() => {
    setFileCurrent(document);
    setFileName(document?.fileName || '');
  }, [document]);

  const onDrop = useCallback(
    (acceptedFiles: any[]) => {
      acceptedFiles.forEach((file: any) => {
        const newFileUpload = {
          file,
          fileName: file.name,
          documentType: value,
          label,
          item: item ?? null,
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
        setFileCurrent(newFileUpload);
        setFileURL(URL.createObjectURL(file));
        setFileName(file.name);
      });
    },
    [value, label, item, handleUpdateListFiles, dispatch]
  );

  const handleDownloadDocument = useCallback(() => {
    if (document) downloadFileFromBlobURL(document.file);
  }, [document]);

  const handleOpenCloseModal = useCallback(() => {
    setOpenDeleteModal(!openDeleteModal);
  }, [openDeleteModal]);

  const handleOpenCloseDialog = useCallback(() => {
    setOpenDialog(!openDialog);
  }, [openDialog]);

  const handleRemoveDocument = () => {
    handleUpdateListFiles(fileCurrent, UpdateTypes.Remove);
    handleOpenCloseModal();
    setFileCurrent(undefined);
    setFileName('');
    setFileURL('');
  };

  const onDeleteDocument = () => {
    handleRemoveDocument();
    handleDeleteDocument(fileName);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    disabled: isDisabled,
  });

  const showTitle = useCallback(() => {
    const fname = fileName.split('-').slice(1).join('-');
    if (!document) return;
    // eslint-disable-next-line consistent-return
    return fname;
  }, [document, fileName]);

  const ctxValue = useMemo(
    () => ({
      open,
      handleOpenCloseDialog,
      handleDownloadDocument,
      handleOpenCloseModal,
      getRootProps,
      getInputProps,
      showTitle,
      document,
    }),
    [
      document,
      getInputProps,
      getRootProps,
      handleDownloadDocument,
      handleOpenCloseDialog,
      handleOpenCloseModal,
      open,
      showTitle,
    ]
  );

  return (
    <div
      className={`${fieldClasses.root}${
        isOtherFile ? `' '${fieldClasses.otherFieldRoot}` : ''
      }`}
    >
      <CustomUploadFileContext.Provider value={ctxValue}>
        {children}
      </CustomUploadFileContext.Provider>
      <CommonModal
        title=""
        open={openDeleteModal}
        handleCloseModal={handleOpenCloseModal}
      >
        <DeleteDocumentModal
          handleOpenCloseModal={handleOpenCloseModal}
          handleRemoveDocument={onDeleteDocument}
          documentType={title}
        />
      </CommonModal>
      {isPolicyDocSection || pathname.endsWith('printing-and-shipping') ? (
        <ShipmentFileBrowseModal
          openDialog={openDialog}
          handleCloseDialog={handleOpenCloseDialog}
          handleDeleteDocument={handleDeleteDocument}
          label={label}
          fileLink={fileURL}
          listFiles={listFiles}
          documents={documents}
          handleUpdateListFiles={handleUpdateListFiles}
          isDisabled={isDisabled}
          shipmentDocs={shipmentDocs}
          policy={item}
        />
      ) : (
        <FileBrowseModal
          type={enablePreviewModalDraggable ? 'draggable' : 'default'}
          openDialog={openDialog}
          handleCloseDialog={handleOpenCloseDialog}
          handleDeleteDocument={handleDeleteDocument}
          label={label}
          fileLink={fileURL}
          listFiles={listFiles}
          documents={documents}
          handleUpdateListFiles={handleUpdateListFiles}
          isDisabled={isDisabled}
          allowPayslipDocument={allowPayslipDocument}
          allowBookBankDocument={allowBookBankDocument}
        />
      )}
    </div>
  );
}

CustomUploadFile.PreviewButton = function PreviewButton({
  children,
}: PropsWithChildren<any>) {
  const { handleOpenCloseDialog } = useContext(CustomUploadFileContext);
  return _isFunction(children) ? children({ handleOpenCloseDialog }) : children;
};

CustomUploadFile.AddButton = function AddButton({
  children,
}: PropsWithChildren<any>) {
  const { open } = useContext(CustomUploadFileContext);
  return _isFunction(children) ? children({ open }) : children;
};

CustomUploadFile.Content = function Content({
  children,
}: PropsWithChildren<any>) {
  return <div>{children}</div>;
};

CustomUploadFile.Title = function Title({ children }: PropsWithChildren<any>) {
  const { showTitle, document } = useContext(CustomUploadFileContext);
  const fieldClasses = useFieldStyleSheet();
  return (
    <p className={document ? fieldClasses.file : fieldClasses.noFile}>
      {_isFunction(children) ? children({ showTitle }) : children}
    </p>
  );
};

CustomUploadFile.ActionButtons = function ActionButtons({
  children,
}: PropsWithChildren<any>) {
  const fieldClasses = useFieldStyleSheet();
  const { handleDownloadDocument, handleOpenCloseModal } = useContext(
    CustomUploadFileContext
  );

  return (
    <div className={fieldClasses.actionButtons}>
      {_isFunction(children)
        ? children({ handleDownloadDocument, handleOpenCloseModal })
        : children}
    </div>
  );
};

CustomUploadFile.Dropzone = function Dropzone({ ...rest }: any) {
  const { getRootProps, getInputProps } = useContext(CustomUploadFileContext);
  const fieldClasses = useFieldStyleSheet();
  return (
    <div
      data-testid="drop-zone"
      className={fieldClasses.dropZone}
      {...(getRootProps && getRootProps({ ...rest }))}
    >
      <input data-testid="drop-input" {...getInputProps()} />
      {getString('text.dragAndDropFile')}
      <span className={fieldClasses.chooseFile}>
        {' '}
        {getString('text.chooseFile')}
      </span>
    </div>
  );
};

export default CustomUploadFile;
