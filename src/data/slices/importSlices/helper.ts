import { PRODUCT_TYPE } from 'config/TypeFilter';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { formatDDMMYYYYHHMMSS, formatDDMMYYYY } from 'shared/helper/utilities';
import { IPageState } from 'shared/interfaces/common/table';

import {
  LeadImportsReponse,
  PackageImportReponse,
  CustomerImportReponse,
  CuratedCarImportReponse,
} from './interface';

// eslint-disable-next-line no-control-regex
export const UnsupportedCharacters = /[^\x20-\x7E]/;

export const initialPageState: IPageState = {
  currentPage: 1,
  pageSize: 15,
  pageToken: '',
  orderBy: '',
  filter: '',
};

export const StatusImportedPackage = [
  { id: 1, title: 'importFileStatus.complete', value: 'COMPLETE' },
  { id: 2, title: 'importFileStatus.inProgress', value: 'IN_PROGRESS' },
  { id: 3, title: 'importFileStatus.waitingUpload', value: 'WAITING_UPLOAD' },
  { id: 4, title: 'importFileStatus.error', value: 'ERROR' },
];

export const customImportedStatus = (status: string) => {
  const findImportedStatus = StatusImportedPackage.find(
    (item) => item.value === status
  );
  return getString(findImportedStatus?.title || '') || '';
};

export const formattedLeadHistory = (importList: LeadImportsReponse[]) =>
  importList.map((importLead) => {
    const displayProduct: string = PRODUCT_TYPE[importLead.product] || '';
    const downloadLink = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.lead.getDownloadLink}/${importLead.name}:generateDownloadUrl`;

    return {
      createBy: importLead.createBy,
      sequenceNumber: importLead.sequenceNumber,
      product: displayProduct,
      createTime: formatDDMMYYYYHHMMSS(importLead?.createTime),
      status: importLead.status,
      imported: importLead.imported,
      downloadLink,
      errors: importLead.errors,
    };
  });

export const formattedCarImportHistory = (
  importList: CustomerImportReponse[]
) =>
  importList.map((carDiscount) => {
    const downloadLink = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.leadImport.getImportDownloadUrlBase}/${carDiscount.name}:generateDownloadUrl`;

    return {
      createBy: carDiscount.createBy,
      filename: carDiscount.filename,
      createTime: formatDDMMYYYYHHMMSS(carDiscount?.createTime),
      status: carDiscount.status,
      errors: carDiscount.errors || [],
      downloadLink,
    };
  });

export const formatImportedPackageHistory = (
  listImportedPackage: PackageImportReponse[]
) =>
  listImportedPackage.map((importedPackage) => {
    const downloadLink = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.package.getPackageImportDownloadUrl}/${importedPackage.name}:generateDownloadUrl`;

    return {
      id: importedPackage.sequenceNumber,
      status: importedPackage?.status,
      createTime: formatDDMMYYYYHHMMSS(importedPackage?.createTime),
      filename: importedPackage.filename,
      createBy: importedPackage.createBy,
      errors: importedPackage.errors,
      packageType: importedPackage?.packageDetails?.packageType || '-',
      imported: importedPackage?.imported,
      downloadLink,
    };
  });

export const formatImportedCustomerHistory = (
  importList: CustomerImportReponse[]
) =>
  importList.map((customer) => {
    const downloadLink = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.leadImport.getImportDownloadUrlBase}/${customer.name}:generateDownloadUrl`;

    const updatedList = {
      createBy: customer.createBy,
      filename: customer.filename,
      createTime: formatDDMMYYYYHHMMSS(customer?.createTime),
      updateTime: formatDDMMYYYYHHMMSS(customer?.updateTime),
      status: customer.status,
      imported: customer?.imported || 0,
      errors: customer.errors || [],
      downloadLink,
    };

    if (customer?.autoassignDetails) {
      return {
        ...updatedList,
        effectiveDate: formatDDMMYYYY(customer.autoassignDetails.effectiveDate),
      };
    }
    if (customer?.templateType) {
      return {
        ...updatedList,
        templateType: customer?.templateType,
      };
    }
    return updatedList;
  });

export const formatImportedCuratedCarHistory = (
  listImportedCuratedCar: CuratedCarImportReponse[]
) =>
  listImportedCuratedCar.map((importedCuratedCar) => {
    const downloadLink = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.package.getPackageImportDownloadUrl}/${importedCuratedCar.name}:generateDownloadUrl`;

    return {
      id: importedCuratedCar.sequenceNumber,
      status: importedCuratedCar?.status,
      createTime: formatDDMMYYYYHHMMSS(importedCuratedCar?.createTime),
      filename: importedCuratedCar.filename,
      createBy: importedCuratedCar.createBy,
      errors: importedCuratedCar.errors,
      downloadLink,
    };
  });

const getFormatterFunction = (tableType: string) => {
  switch (tableType) {
    case 'carSubModel':
    case 'carModel':
    case 'carBrand':
    case 'redbook':
      return formattedCarImportHistory;
    case 'package':
      return formatImportedPackageHistory;
    case 'curatedCar':
      return formatImportedCuratedCarHistory;
    case 'customerProfile':
    case 'autoAssignImport':
    case 'massLeadImport':
    case 'discountsImport':
    case 'massStatusChange':
      return formatImportedCustomerHistory;
    case 'leads':
    default:
      return formattedLeadHistory;
  }
};

export default getFormatterFunction;
