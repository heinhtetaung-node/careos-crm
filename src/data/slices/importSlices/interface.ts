import { ImportType } from 'shared/constants/importFile';

export interface LeadImportsReponse {
  name: string;
  sequenceNumber: number;
  product: string;
  imported: string;
  status: string;
  errors: any;
  createTime: string;
  createBy: string;
}

interface IPackageDetails {
  packageType: string;
}

export interface PackageImportReponse {
  name: string;
  sequenceNumber: number;
  imported: string;
  status: string;
  errors: any;
  createTime: string;
  createBy: string;
  filename: string;
  packageDetails: IPackageDetails;
}

export enum DiscountRulesTypes {
  CAR_NON_PREMIUM = 'CAR_NON_PREMIUM',
  CAR_PREMIUM = 'CAR_PREMIUM',
}
export enum CustomerDetailSourceTypes {
  NANA = 'NANA',
  BTS = 'BTS',
  CARE_SHOP = 'CareSHOP',
  ADB = 'ADB',
}
export interface Upload {
  file: File;
  importType: ImportType;
  packageDetails?: {
    packageType: 'STANDARD' | 'RENEWAL' | 'MANDATORY';
  };
  customerDetails?: {
    source: CustomerDetailSourceTypes;
  };
  autoAssignDetails?: {
    effectiveDate: string;
  };
  agent_discount_rule_details?: {
    type: DiscountRulesTypes;
  };
  product: string;
  orderStatusDetails?: {
    status_name: string;
  };
  leadDetails?: {
    source: string;
  };
}

export interface UploadCredentials {
  url: string;
  headers: any;
}

export interface CustomerImportReponse {
  name: string;
  sequenceNumber: number;
  imported: string;
  status: string;
  errors: any;
  createTime: string;
  updateTime: string;
  createBy: string;
  filename: string;
  templateType?: string;
  autoassignDetails?: {
    effectiveDate: string;
  };
}

export interface CuratedCarImportReponse {
  name: string;
  sequenceNumber: number;
  status: string;
  errors: any;
  createTime: string;
  createBy: string;
  filename: string;
}
