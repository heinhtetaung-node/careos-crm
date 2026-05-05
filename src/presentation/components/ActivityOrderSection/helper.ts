import {
  DocumentType,
  docTypes as CustomerDocumentTypes,
  healthDocTypes as CustomerHealthDocumentTypes,
  DocumentConfigType,
} from './Document/config';

import { IUploadedDocument } from './DocumentSection';

export type DocumentFile = {
  value: string;
  label: string;
  name: string;
  document?: { name: string };
};

const getPolicyIdFromName = (policyName = '') =>
  policyName?.split('/items/')[1] ?? '';

export const calculateUploadedDocumentsCount = (
  documents: (IUploadedDocument | null)[],
  docTypes: DocumentConfigType[]
) => {
  const noOfOtherDocuments = documents.filter(
    (udoc) => udoc?.type === DocumentType.DOCUMENT_TYPE_OTHERS
  ).length;

  const noOfCustomerDocuments = new Set(
    documents
      .filter((udoc) =>
        docTypes.find((doc: DocumentConfigType) => doc.value === udoc?.type)
      )
      .map((doc) => doc?.type)
  ).size; // sometime customer upload documents can contain duplicate document type(e.g. two `secondNamedDriverLicense`) so need to dedupe.

  return noOfCustomerDocuments + noOfOtherDocuments;
};

export function getCustomerDocumentType(
  exclude?: DocumentType[],
  isHealth = false,
  isHealthOrderDetail = false
) {
  if (isHealth) return CustomerHealthDocumentTypes(isHealthOrderDetail);
  if (!exclude || exclude.length < 1) return CustomerDocumentTypes();
  return CustomerDocumentTypes().filter((doc) => !exclude.includes(doc.value));
}

export default {
  getPolicyIdFromName,
};
