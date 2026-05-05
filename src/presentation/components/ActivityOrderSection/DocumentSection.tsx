import {
  DownloadFileIcon,
  FileSearchIcon,
  TrashIcon,
} from '@alphafounders/icons';
import { Fab as MuiButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import React, {
  useState,
  createContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useMatch } from 'react-router-dom';

import { DocumentType } from './Document/config';
import { getString } from 'presentation/theme/localization';
import {
  formatDoc as formatDocument,
  getDocByType,
} from 'shared/helper/documentHelper';
import {
  downloadFileFromBlobURL,
  runAsyncFuntionsConsecutively,
} from 'shared/helper/downloadDocumentHelper';

import CustomUploadFile from './common/CustomUploadFile';
import CustomFields from './CustomFields';
import { useFieldStyleSheet, ButtonStyleSheet } from './document.styles';
import {
  calculateUploadedDocumentsCount,
  getCustomerDocumentType,
} from './helper';
import ReplaceDocumentButton from './common/ReplaceDocumentButton';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

const Button = ButtonStyleSheet(MuiButton);

export const CustomFieldsContext = createContext<ICustomFieldsContext>(
  {} as ICustomFieldsContext
);

interface ICustomFieldsContext {
  handleUpdateListFiles: (
    newFile: FilesDownload | undefined,
    typeUpdate: UpdateTypes
  ) => void; // Later, we should create type alias for handleUpdateListFiles
  handleDeleteDocument: (payload: string) => void;
  handleCustomFieldPreview?: (doc: any) => void;
  listFiles: (FilesDownload | undefined)[];
  disabledFileUpload?: boolean;
  disabledFileDeleted?: boolean;
  allowPayslipDocument?: boolean;
  allowBookBankDocument?: boolean;
}

export enum UpdateTypes {
  Upload = 'upload',
  Remove = 'remove',
}

export interface FilesDownload {
  file: any;
  fileName: string;
  documentType: string;
  label: string;
  item?: string;
}

interface DocumentSectionProps {
  handleUploadDocument: (payload: any) => void;
  handleDeleteDocument: (payload: any) => void;
  documents?: (IUploadedDocument | null)[];
  isDisabled?: boolean;
  enablePreviewModalDraggable?: boolean;
  allowPayslipDocument?: boolean;
  allowBookBankDocument?: boolean;
  isEnabledForReplaceDoc?: boolean;
}

export interface IDocument {
  document: string;
  label: string;
  type: string;
}

export interface IUploadedDocument {
  document: string;
  label: string;
  name: string;
  type: string;
  createBy: string;
  createTime: string;
  deleteTime: string | null;
  updateTime: string | null;
  fileType?: string;
}

export interface IPolicyDocType {
  title: string;
  value: string;
  label: string;
}

export const handleDownloadAllFiles = (
  documents: (IUploadedDocument | null)[],
  getDownloadDocuments: () => any,
  formatDoc: (doc: IDocument) => {
    file: string;
    fileName: string;
    documentType: string;
  }
) => {
  const otherPolicyDocuments = {
    title: getString('leadDetailFields.others'),
    value: DocumentType.DOCUMENT_TYPE_OTHERS,
    label: 'others',
  };

  const otherDocuments = documents
    .filter((doc: any) => doc.type === DocumentType.DOCUMENT_TYPE_OTHERS)
    .map((doc: any) => ({
      ...otherPolicyDocuments,
      document: formatDoc(doc),
    }));

  const downloadDocuments = [...otherDocuments, ...getDownloadDocuments()].map(
    (doc: any) => ({
      docID: doc.document.file,
      fileName: doc.document.fileName,
    })
  );

  const downloadDocumentsArray = downloadDocuments.map(
    (doc: any) => () => downloadFileFromBlobURL(doc.docID)
  );
  runAsyncFuntionsConsecutively(downloadDocumentsArray, 0);
};

function DocumentSection({
  handleUploadDocument = () => null,
  handleDeleteDocument = () => null,
  documents = [],
  isDisabled = false,
  enablePreviewModalDraggable = false,
  allowPayslipDocument = false,
  allowBookBankDocument = false,
  isEnabledForReplaceDoc = false,
}: DocumentSectionProps) {
  const payslipFeatureEnabled = false;

  const bookBankFeatureEnabled = false;

  const [listFiles, setListFiles] = useState<(FilesDownload | undefined)[]>([]);
  const fieldClasses = useFieldStyleSheet();
  const [documentContentHeight, setDocumentContentHeight] = useState(0);
  const routeMatchQc: any = useMatch('/orders/qc/:id');

  const matchMyOrder = useMatch('/health/orders/my-orders/:id');
  const matchOrder = useMatch('/health/orders/:id');
  const routeMatchHealthQc = useMatch('/health/orders/qc/:id');
  const routeMatchHealthOrderDetail =
    matchMyOrder ?? matchOrder ?? routeMatchHealthQc;

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const showPayslipDocument = allowPayslipDocument && payslipFeatureEnabled;
  const showBookBankDocument = allowBookBankDocument && bookBankFeatureEnabled;

  const excludeDocTypes: DocumentType[] = [];

  if (!showPayslipDocument)
    excludeDocTypes.push(DocumentType.DOCUMENT_TYPE_PAYMENT_SLIP);

  if (!showBookBankDocument)
    excludeDocTypes.push(DocumentType.DOCUMENT_TYPE_BOOK_BANK);

  const modifiedDocTypes = getCustomerDocumentType(
    excludeDocTypes,
    globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    routeMatchHealthOrderDetail !== null
  );
  const noOfUploadedDocuments = calculateUploadedDocumentsCount(
    documents,
    modifiedDocTypes
  );

  useEffect(() => {
    if (!routeMatchQc) return;
    const updateSize = () => {
      const headerHeight =
        document.querySelector('[id=app-bar-header]')?.clientHeight ?? 0;
      // 80 is tab height + extra space for nicer look and feel
      setDocumentContentHeight(window.innerHeight - headerHeight - 80);
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    // eslint-disable-next-line consistent-return
    return () => window.removeEventListener('resize', updateSize);
  }, [routeMatchQc]);

  const handleUpdateListFiles = useCallback(
    (newFile: FilesDownload | undefined, typeUpdate: UpdateTypes) => {
      if (typeUpdate === UpdateTypes.Upload) {
        setListFiles([...listFiles, newFile]);
        handleUploadDocument(newFile);
      } else {
        setListFiles(
          listFiles.filter(
            (item) => item?.documentType !== newFile?.documentType
          )
        );
      }
    },
    [handleUploadDocument, listFiles]
  );

  const mapDocumentsToPolicyDocs = (docs: IPolicyDocType[]) =>
    docs.map((doc: IPolicyDocType) => ({
      ...doc,
      document: getDocByType({
        type: doc?.value,
        label: doc?.label,
        documents,
      }),
    }));

  const getDownloadDocuments = () =>
    mapDocumentsToPolicyDocs(modifiedDocTypes).filter(
      (field: any) => !!field.document
    );

  const customFieldsValue = useMemo(
    () => ({
      handleUpdateListFiles,
      handleDeleteDocument,
      listFiles,
      allowPayslipDocument,
      allowBookBankDocument,
    }),
    [
      handleDeleteDocument,
      handleUpdateListFiles,
      listFiles,
      allowBookBankDocument,
      allowPayslipDocument,
    ]
  );

  const documentSectionStyle: React.StyleHTMLAttributes<HTMLElement> = {
    style: {
      height:
        documentContentHeight && routeMatchQc
          ? `${documentContentHeight}px`
          : 'auto',
    },
  };

  return (
    <div
      data-testid="document-section"
      className="overflow-y-auto"
      {...documentSectionStyle}
    >
      <div className={fieldClasses.root}>
        <Button
          size="small"
          data-testid="download-all-files"
          onClick={() => {
            handleDownloadAllFiles(
              documents,
              getDownloadDocuments,
              formatDocument
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
      {mapDocumentsToPolicyDocs(modifiedDocTypes).map((field: any) => (
        <CustomUploadFile
          key={field.title}
          title={field.title}
          value={field.value}
          handleUpdateListFiles={handleUpdateListFiles}
          handleDeleteDocument={handleDeleteDocument}
          enablePreviewModalDraggable={enablePreviewModalDraggable}
          listFiles={listFiles}
          document={field.document}
          label={field?.label || ''}
          documents={documents}
          isDisabled={isDisabled}
          allowPayslipDocument={allowPayslipDocument}
          allowBookBankDocument={allowBookBankDocument}
        >
          {!field.document ? (
            <CustomUploadFile.AddButton>
              {({ open }: any) => (
                <Button size="small" onClick={open} disabled={isDisabled}>
                  <AddCircleOutlineIcon fontSize="small" color="primary" />
                </Button>
              )}
            </CustomUploadFile.AddButton>
          ) : (
            <CustomUploadFile.PreviewButton>
              {({ handleOpenCloseDialog }: any) => (
                <Button size="small" onClick={handleOpenCloseDialog}>
                  <FileSearchIcon fontSize="small" color="primary" />
                </Button>
              )}
            </CustomUploadFile.PreviewButton>
          )}
          <CustomUploadFile.Content>
            <CustomUploadFile.Title>
              {field.title}
              {field.isRequired && <span className="asterisk">*</span>}
            </CustomUploadFile.Title>
            {!field.document && <CustomUploadFile.Dropzone />}
          </CustomUploadFile.Content>
          {field.document && (
            <CustomUploadFile.ActionButtons>
              {({ handleDownloadDocument, handleOpenCloseModal }: any) => (
                <>
                  {isDisabled && isEnabledForReplaceDoc && (
                    <ReplaceDocumentButton
                      field={field}
                      handleDeleteDocument={handleDeleteDocument}
                      handleUpdateListFiles={handleUpdateListFiles}
                    />
                  )}
                  <Button size="small" onClick={handleDownloadDocument}>
                    <DownloadFileIcon fontSize="small" />
                  </Button>
                  <Button
                    size="small"
                    onClick={handleOpenCloseModal}
                    disabled={isDisabled}
                  >
                    <TrashIcon fontSize="small" color="primary" />
                  </Button>
                </>
              )}
            </CustomUploadFile.ActionButtons>
          )}
        </CustomUploadFile>
      ))}
      <CustomFieldsContext.Provider value={customFieldsValue}>
        <CustomFields documents={documents} isDisabled={isDisabled} />
      </CustomFieldsContext.Provider>
    </div>
  );
}

export default DocumentSection;
