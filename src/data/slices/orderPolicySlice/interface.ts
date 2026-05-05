import {
  AddOnTypes,
  OrderQcStatus,
  PackageType,
} from 'shared/constants/orderType';
import { Policy } from 'shared/interfaces/common/order/policy';
import { Address } from 'shared/types/customer';

import { ShipmentResponse } from '../shipmentSlice';

enum DiscountType {
  DISCOUNT_TYPE_CAR = 'DISCOUNT_TYPE_CAR',
  DISCOUNT_TYPE_VOUCHER = 'DISCOUNT_TYPE_VOUCHER',
  DISCOUNT_TYPE_FIXED_DRIVER = 'DISCOUNT_TYPE_FIXED_DRIVER',
  DISCOUNT_TYPE_RENEWAL = 'DISCOUNT_TYPE_RENEWAL',
  DISCOUNT_TYPE_NEW_CUSTOMER = 'DISCOUNT_TYPE_NEW_CUSTOMER',
}

export type ItemDiscount = {
  amount: string;
  name: string;
  percentage: number;
  type: DiscountType;
};

export interface ItemElement {
  item: Item;
  package: ItemPackage;
  healthPackage?: ItemHealthPackage;
  discounts?: ItemDiscount[];
}

export interface Item {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime: null;
  product: string;
  package: string;
  price: string;
  grossPremium: string;
  netPremium: string;
  vatPercent: number;
  vatAmount: string;
  stampDutyPercentage: number;
  stampDuty: string;
  addons: any[];
  documentStatus: string;
  qcStatus: string;
  submissionStatus: string;
  approvalStatus: string;
  discounts: any[];
  motorItemType: string;
  isCancelled: boolean;
  submissionBy: string;
  approvalBy: string;
  submitDate: null;
  insurer: string;
  humanId: string;
  adjustedPremium: string;
  sumInsured: string;
  policyStartDate: string;
  policyNumber: string;
  trackingNumber: string;
  cancelTime: null;
  approvalTime: string;
  applicationNumber: string;
}

export interface CommonPackageInterface {
  name: string;
  displayName: string;
  price: string;
  insurer: string;
  carInsuranceType: string;
  isFixedPremium: boolean;
  deductibleAmount: string;
  sumCoverageMin: string;
  sumCoverageMax: string;
  bailBondCoverage: string;
  fireTheftCoverage: string;
  floodCoverage: string;
  medicalExpensesCoverage: string;
  medicalExpensesCoverageNo: number;
  personalAccidentCoverage: string;
  personalAccidentCoverageNo: number;
  liabilityPropertyCoverage: string;
  liabilityPerPersonCoverage: string;
  liabilityPerAccidentCoverage: string;
  carRepairType: string;
  carAgeMin: number;
  carAgeMax: number;
  modifiedCarAccepted: boolean;
  oicCode: string;
  termsEn: string;
  termsTh: string;
  expireTime: string;
  status: string;
  filename: string;
  createTime: string;
  updateTime: string;
  broker: string;
  source: string;
  code: number;
  insurerPackageCode: string;
  isEcoCar: boolean;
  yearlyMileage: number;
  antiTheftDiscount: string;
  yearsOwned: number;
  numberVehiclesHousehold: number;
  carRegistrationCategory: string;
  drivingPurpose: string;
  parkingLocation: string;
  maritalStatus: string;
  occupation: string;
  drivingExperience: number;
  reuseManualPackage: boolean;
  hasCctvDiscount: boolean;
}

export interface ItemPackage extends CommonPackageInterface {
  startTime: string;
  isLowCost: boolean;
  provinces: string[];
  gender: string;
  carUsingPurpose: string;
  noClaimBonus: string;
  excessType: string;
  minYearsOfHoldingDriverLicense: number;
  maxYearsOfHoldingDriverLicense: number;
  minNumberOfClaimsInYear: number;
  maxNumberOfClaimsInYear: number;
  maxAge: number;
  minAge: number;
  minMileage: number;
  maxMileage: number;
  carSubmodels: string[];
  insuranceCategory: string;
  packageType: string;
}

export interface ItemHealthPackage {
  category: string;
  displayNameTh: string;
}

export interface OrderPolicy {
  hasMultiplePolicies?: boolean;
  insuranceCategory?: string;
  policy: Policy;
  order: any;
  motorPackage: any;
  paymentType: string;
  customerInfo?: Record<string, any>;
  policyHolderName: string;
  packageType: string;
}

export interface OrderPackage {
  orderId?: string;
  policyId?: string;
  hasShippingSection?: boolean;
}

export interface OrderItems {
  items: Item[];
  nextPageToken: string;
}

export interface InsurerName {
  displayName: string;
}

export interface Car {
  displayName: string;
  year: number;
}

export interface Package {
  insurer: string;
  packageType: PackageType;
  insuranceCategory: string;
}
export interface Data {
  carDashCam: boolean;
  carLicensePlate: string;
  carModified: boolean;
  carSubModelYear: number;
  carUsageType: string;
  chassisNumber: string;
  docsShipmentMethod: string;
  deliveryOption: string;
  engineNumber: string;
  firstDriverDOB: string;
  firstDriverName: string;
  firstDriverDrivingLicense?: string;
  firstDriverIdNumber?: string;
  numberOfSeats: number;
  oicCode: string;
  policyHolder: PolicyHolder;
  registeredProvince: number;
  secondDriverDOB: string;
  secondDriverName: string;
  secondDriverDrivingLicense?: string;
  secondDriverIdNumber?: string;
  vehicleColor: string[];
  isOfflinePayment: boolean;
  isRedPlate: boolean;
  shipmentFee: number;
  idNumber: string;
  idType: string;
}

export interface PolicyHolder {
  communicationLanguage: string;
  companyName: string;
  companyTaxId: string;
  dateOfBirth: string;
  firstName: string;
  gender: string;
  isCompany: boolean;
  isCustomer: boolean;
  lastName: string;
  nationalID: string;
  policyAddress: Address;
  shippingAddress: Address;
  title: string;
}

interface Attributes {
  documentStatusUpdateTime: string;
  earliestPolicyStartDate: Date;
  leadHumanID: string;
  qcStatusUpdateTime: string;
  source: string;
  sourceDisplayName: string;
}

interface OrderData {
  name: string;
  lead: string;
  createTime: Date;
  updateTime: string;
  deleteTime: null;
  convertBy: string;
  supervisor: string;
  isCancelled: boolean;
  product: string;
  invoicePrice: number | string;
  humanId: string;
  discounts: { amount: number }[];
  payment: string;
  customer: string;
  schema: string;
  data: Data;
  documentBy: string;
  documentStatus: string;
  qcBy: string;
  qcStatus: string;
  isUrgentDelivery: boolean;
  isFullyPaid: boolean;
  cancelTime: string;
  firstDriverDOB?: string;
  secondDriverDOB?: string;
}
export interface Order {
  attributes: Attributes;
  order: OrderData;
  items: Item[];
  latestShipments: { item: string; shipment: ShipmentResponse }[];
  customer: { firstName: string; lastName: string };
  lead?: string;
  humanId?: string;
  isCancelled?: boolean;
  documentStatus?: string;
  qcStatus?: OrderQcStatus;
  qcAgent: string;
  qcTeam: string;
  name?: string;
}

export interface Insurer {
  orderId: string;
  policyId: string;
  policyStartDate?: string;
  adjustedPremium?: number;
  policyNumber?: string;
  trackingNumber?: string;
}

export interface PolicyPayload {
  [key: string]: any;
}

export interface PolicyApprovalStatusPayload {
  name: string;
  status: string;
}

interface AddOn extends Item {
  addOns: string[];
  addonType: AddOnTypes;
}

export interface AddOnResponse {
  addons: AddOn[];
  nextPageToken: string;
}
