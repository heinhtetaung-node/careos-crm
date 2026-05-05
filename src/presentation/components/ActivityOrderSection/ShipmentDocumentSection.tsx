/* eslint-disable react-hooks/exhaustive-deps */
import { TrashIcon, DownloadFileIcon } from '@alphafounders/icons';
import { Fab as MuiButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentType } from './Document/config';
import { DocumentConfigType, policyDocTypes } from './Document/config';
import { useGetOrderPolicyQuery } from 'data/slices/orderPolicySlice';
import { useLazyGetPolicyDocsQuery } from 'data/slices/policyDocsSlice';
import { useLazyGetShipmentDocsQuery } from 'data/slices/shipmentSlice';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import {
  MotoTypes as InsuranceType,
  PackageType,
} from 'shared/constants/orderType';
import { formatDoc, getDocByType } from 'shared/helper/documentHelper';

import CustomUploadFile from './common/CustomUploadFile';
// higher order style components, styles hook
import { useFieldStyleSheet, ButtonStyleSheet } from './document.styles';
import DocumentPreviewButton from './DocumentPreviewButton';
import {
  FilesDownload,
  handleDownloadAllFiles,
  IPolicyDocType,
  IUploadedDocument,
  UpdateTypes,
} from './DocumentSection';
import ShipmentHelper from './helper';
import ReplaceDocumentButton from './common/ReplaceDocumentButton';

const Button = ButtonStyleSheet(MuiButton);

interface ShipmentDocumentSectionProps {
  handleUploadDocument: (payload: any) => void;
  handleDeleteDocument: (payload: any) => void;
  isDisabled?: boolean;
  isEnabledForReplaceDoc?: boolean;
  healthPolicyId?: string;
}

function ShipmentDocumentSection({
  handleUploadDocument,
  handleDeleteDocument,
  isDisabled = false,
  isEnabledForReplaceDoc = false,
  healthPolicyId,
}: ShipmentDocumentSectionProps) {
  const [listFiles, setListFiles] = useState<(FilesDownload | undefined)[]>([]);
  const fieldClasses = useFieldStyleSheet();
  const [currentDocs, setCurrentDocs] = useState<DocumentConfigType[] | []>([]);

  const { orderId, policyId: carPolicyId } = useParams<{
    orderId?: string;
    policyId?: string;
  }>();

  const policyId = carPolicyId || healthPolicyId;

  const [uploadedDocs, setUploadedDocs] = useState<
    (IUploadedDocument | null)[]
  >([]);

  const [getShipmentDocs, { data: shipmentDocs }] =
    useLazyGetShipmentDocsQuery();
  const { data: orderPolicy } = useGetOrderPolicyQuery(
    {
      orderId,
      policyId,
      hasShippingSection: true,
    },
    {
      skip: !orderId && !policyId,
    }
  );

  const [getPolicyDocs, { data: policyDocs }] = useLazyGetPolicyDocsQuery();

  useEffect(() => {
    if (policyDocs?.documents?.length > 0) {
      setUploadedDocs(policyDocs?.documents ?? []);
    }
  }, [policyDocs]);

  const uploadedDocuments = useAppSelector(
    (currentState) => currentState.orderUploadDocumentReducer.documents
  );

  useEffect(() => {
    if (orderId && orderPolicy?.policy?.name) {
      getPolicyDocs({
        orderId,
        policyId: ShipmentHelper.getPolicyIdFromName(orderPolicy.policy.name),
      });
    }
  }, [uploadedDocuments, orderPolicy]);

  useEffect(() => {
    if (orderPolicy) {
      getShipmentDocs({
        insurerId: orderPolicy?.policy?.insurer ?? '',
        packageType: orderPolicy.motorPackage.packageType
          ? PackageType[orderPolicy.motorPackage.packageType as PackageType]
          : PackageType.STANDARD,
        insuranceType:
          (orderPolicy?.policy?.motorItemType as InsuranceType) ??
          'MOTOR_TYPE_1',
      });
    }
  }, [orderPolicy]);

  useEffect(() => {
    let allowedDocs: any[] = [];
    if (shipmentDocs?.documents?.length) {
      allowedDocs = policyDocTypes().map((item) => ({
        ...item,
        isRequired: healthPolicyId
          ? [DocumentType.DOCUMENT_TYPE_POLICY].includes(item.value)
          : item.value === 'DOCUMENT_TYPE_INSURER_RECEIPT'
            ? false
            : (shipmentDocs.documents.find(
                (doc) => doc.documentType === item.value
              )?.required ?? false),
      }));
    }
    if (policyDocs?.documents.length) {
      const allowedUploadedDocs: (IUploadedDocument | null)[] =
        policyDocs?.documents.filter((i: any) =>
          allowedDocs.find((j) => j?.value === i.type)
        );
      setUploadedDocs(allowedUploadedDocs);
    }
    if (!carPolicyId) {
      allowedDocs = allowedDocs.filter(
        (doc) => doc.value !== 'DOCUMENT_TYPE_KNOCK_KNOCK'
      );
    }
    setCurrentDocs(allowedDocs);
  }, [shipmentDocs, policyDocs]);

  const handleUpdateListFiles = (
    newFile: FilesDownload | undefined,
    typeUpdate: UpdateTypes
  ) => {
    if (typeUpdate === UpdateTypes.Upload) {
      setListFiles([...listFiles, newFile]);
      handleUploadDocument(newFile);
    } else {
      setListFiles(
        listFiles.filter((item) => item?.documentType !== newFile?.documentType)
      );
    }
  };

  const mapDocumentsToPolicyDocs = (docs: IPolicyDocType[]) =>
    docs.map((doc: IPolicyDocType) => ({
      ...doc,
      document: getDocByType({
        type: doc?.value,
        label: doc?.label,
        documents: uploadedDocs,
      }),
    }));

  const getDownloadDocuments = () =>
    mapDocumentsToPolicyDocs(currentDocs).filter(
      (field: any) => !!field.document
    );

  return (
    <div data-testid="shipment-document-section">
      <div className={fieldClasses.root}>
        <Button
          size="small"
          data-testid="download-all-files"
          onClick={() => {
            handleDownloadAllFiles(
              uploadedDocs,
              getDownloadDocuments,
              formatDoc
            );
          }}
        >
          <DownloadFileIcon fontSize="small" />
        </Button>
        <span className={fieldClasses.file}>
          {getString('text.downloadFiles', {
            count: uploadedDocs.length,
          })}
        </span>
      </div>

      {mapDocumentsToPolicyDocs(currentDocs).map((field: any) => (
        <CustomUploadFile
          key={field.title}
          title={field.title}
          value={field.value}
          handleUpdateListFiles={handleUpdateListFiles}
          handleDeleteDocument={handleDeleteDocument}
          listFiles={listFiles}
          document={field.document}
          label={field?.label || ''}
          documents={uploadedDocs}
          isDisabled={isDisabled}
          shipmentDocs={currentDocs}
          item={`items/${
            (orderPolicy?.policy?.name ?? '').split('/items/')[1]
          }`}
          isPolicyDocSection
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
                <DocumentPreviewButton
                  field={field}
                  handleOpenCloseDialog={handleOpenCloseDialog}
                  uploadedDocs={uploadedDocs}
                />
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
                      item={`items/${
                        (orderPolicy?.policy?.name ?? '').split('/items/')[1]
                      }`}
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
    </div>
  );
}

export default ShipmentDocumentSection;
