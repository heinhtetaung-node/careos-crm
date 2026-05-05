import * as CONSTANTS from 'shared/constants';

import { IResource } from '../../../../../shared/interfaces/common/resource';
import { queryString } from '../../helper/queryString.helper';
import Type from '../../type';

const getAllCarSubModel = (payload?: any): IResource => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiUrl.package.gettAllCarSubmodel}?${
    payload ? queryString(payload) : 'pageSize=1000'
  }`,
});

const getAllCarModel = (payload?: any): IResource => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiUrl.package.getAllCarModel}?${
    payload ? queryString(payload) : 'pageSize=100'
  }`,
});

const getAllInsurer = (payload?: any): IResource => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiUrl.package.getAllInsurer}?${
    payload ? queryString(payload) : 'pageSize=100'
  }`,
});

const GenerateImportPackage = () => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiEndpoint.importLeadEndPoint_v2}/imports`,
});

const GenerateUploadPackageUrl = (payload: string) => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiEndpoint.importLeadEndPoint_v2}/imports/${payload}:generateUploadUrl`,
});

const UploadFilePackageByUrl = (payload: string) => ({
  Type: Type.Attachment,
  Path: payload,
});

const getImportedPackageHistory = (
  body: any,
  productName: string
): IResource => {
  const name = productName?.replace('products/', '') || 'car-insurance';

  return {
    Type: Type.Public,
    Path: `/${CONSTANTS.apiUrl.package.getImportedPackageHistory}?${queryString(
      body
    )}&product=${name}${
      body.orderBy || ''
    }&filter=importType="PACKAGE" status!="WAITING_UPLOAD"`,
  };
};

export default {
  getAllCarSubModel,
  getAllCarModel,
  getAllInsurer,
  GenerateImportPackage,
  GenerateUploadPackageUrl,
  UploadFilePackageByUrl,
  getImportedPackageHistory,
};
