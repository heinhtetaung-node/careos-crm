import { ChargeResponse } from 'data/slices/transactionSlice/interface';
import { PurchasingPurposes } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';

import { Address, PhoneNumber } from './customer';
import { DownloadInsuranceKind, InsuranceKind } from './insurers';
import { InstallmentDetail, PriceDetail, PriceSummary } from './packages';

export type LeadStatus =
  | 'LEAD_STATUS_NEW'
  | 'LEAD_STATUS_VALID'
  | 'LEAD_STATUS_CONTACTED'
  | 'LEAD_STATUS_INTERESTED'
  | 'LEAD_STATUS_PROSPECT'
  | 'LEAD_STATUS_PENDING_PAYMENT'
  | 'LEAD_STATUS_PURCHASED'
  | 'LEAD_STATUS_CANCELLED'
  | 'LEAD_STATUS_PAID_ONLINE';

export type LeadType =
  | 'LEAD_TYPE_NEW'
  | 'LEAD_TYPE_RENEWAL'
  | 'LEAD_TYPE_RETAINER';

export type PolicyHolderType = PurchasingPurposes;

export type Checkout = {
  package?: string;
  installments?: number;
  coupon?: string;
  deliveryOption?: string;
  paymentOption?: string;
  paymentMethod?: string;
};

export interface Lead {
  annotations: null | Record<string, any>;
  assignedTo: string;
  createBy: string;
  createTime: string;
  deleteTime: null | string;
  updateTime: null | string;
  humanId: string;
  important: boolean;
  isRejected: boolean;
  name: string;
  product: string;
  reference: string;
  root: string;
  schema: string;
  source: string;
  status: LeadStatus;
  type: LeadType;
  data: {
    insurance?: any;
    // newly added fields
    firstDriverFirstName?: string;
    firstDriverLastName?: string;
    firstDriverNationalId?: string;
    firstDriverPassport?: string;
    firstDriverLicense?: string;
    secondDriverFirstName?: string;
    secondDriverLastName?: string;
    secondDriverNationalId?: string;
    secondDriverPassport?: string;
    secondDriverLicense?: string;

    carColor: string[];
    carDashCam: boolean;
    carModified: boolean;
    carLicensePlate?: string;
    carSubModelYear: number;
    carUsageType: 'personal' | 'commercial';
    chassisNumber: string;
    checkout?: Checkout;
    compulsoryPolicyStartDate?: string;
    currentInsurer?: number;
    customerBillingAddress: Address[];
    customerDOB: string;
    customerEmail: string[];
    customerFirstName: string;
    customerGender: 'f' | 'm';
    customerLastName: string;
    customerPhoneNumber: PhoneNumber[];
    customerPolicyAddress: Address[];
    customerShippingAddress: Address[];
    insuranceKind: InsuranceKind;
    locale: string;
    marketingConsent: boolean;
    numberOfFixedDriver: number;
    firstDriverDOB?: string;
    secondDriverDOB?: string;
    policyHolderDOB?: string;
    policyHolderFirstName?: string;
    policyHolderLastName?: string;
    policyHolderType: PolicyHolderType;
    policyHolderRace?: string;
    policyHolderOccupation?: string;
    policyStartDate: string;
    policyExpiryDate?: string;
    policyHolderNationalId?: string;
    policyTitle?: string;
    preferredInsurer?: number;
    preferredSumInsured?: number;
    primaryPhoneIndex: number;
    registeredProvince: number;
    sundayContactable: boolean;
    utm: Record<string, string>;
    vehicleIdNumber: number;
    voluntaryInsuranceType: string[];
    shippingOption: string;
    customer?: {
      dob: string;
      title: string;
      nationalId: string;
      weight: number;
      height: number;
      occupation: string;
      workAddress: string;
      phoneNumbers: {
        phone: string;
        status: string;
      }[];
    };
    policyHolder?: {
      dob: string;
      weight: number;
      height: number;
      jobDescription: string;
      gender: string;
    };
  };
}

export interface HealthLead {
  important: boolean;
  name: string;
  createTime: string; // ISO date string
  updateTime: string; // ISO date string
  deleteTime: string | null; // ISO date string or null
  createBy: string;
  product: string;
  schema: string;
  data: {
    policyHolderOccupation: string;
    policyHolderRace: string;
    beneficiaries: {
      email: string;
      firstName: string;
      gender: 'm' | 'f';
      lastName: string;
      phone: string;
      relationship: string;
      title: string;
      address: string;
    }[];
    billingAddresses: Address[];
    callAvailability: {
      day: string;
      interval: string;
    };
    checkout?: Checkout;
    currentInsurer: number;
    customer: {
      dob: string; // ISO date string
      emails: string[];
      firstName: string;
      gender: 'm' | 'f';
      isThaiNational: boolean;
      lastName: string;
      phoneNumbers: {
        phone: string;
        status: string;
      }[];
      primaryPhoneIndex: number;
      title: string;
      nationalId: string;
      weight: number;
      height: number;
      occupation: string;
      workAddress: string;
    };
    insurance: {
      category?: string;
      coverages?: string[];
      subCategory: string;
      plan?: string;
      type?: string;
      preferredInsurer?: string;
      currentInsurer?: string;
      policyStartDate?: string;
      policyEndDate?: string;
      isInsurerMonthlyPremium: boolean;
      needTaxExemption: boolean;
    };
    insuranceConsent: {
      claimResponsibility: boolean;
      coverageReview: boolean;
      dataAccuracyResponsibility: boolean;
      familyHealthHistory: boolean;
      medicalHistory: boolean;
      medicationDrugUse: boolean;
      motorcycleUsage: boolean;
      policyUnderstanding: boolean;
      recentHospitalization: boolean;
      refusalCondition: boolean;
      surgicalAdvice: boolean;
    };
    marketingConsent: {
      dataAnalytics: boolean;
      offerFromBusinessPartners: boolean;
      personalizedOffers: boolean;
      termsAndConditions: boolean;
    };
    policyAddresses: Address[];
    policyExpiryDate: string; // ISO date string
    policyHolder: {
      dob: string; // ISO date string
      firstName: string;
      gender: 'm' | 'f';
      jobDescription: string;
      lastName: string;
      locale: string;
      nationalId: string;
      occupation: string;
      passport: string;
      race: string;
      title: string;
      type: string;
      weight: number;
      height: number;
    };
    policyStartDate: string; // ISO date string
    preferredInsurer: number;
    preferredSumInsured: number;
    shippingAddresses: Address[];
  };
  source: string;
  assignedTo: string;
  status: LeadStatus;
  humanId: string;
  root: string;
  type: LeadType;
  isRejected: boolean;
  reference: string;
  annotations: null | Record<string, any>;
}

export enum InsuranceType {
  TYPE_1 = 'TYPE_1',
  TYPE_2 = 'TYPE_2',
  TYPE_2_PLUS = 'TYPE_2_PLUS',
  TYPE_3 = 'TYPE_3',
  TYPE_3_PLUS = 'TYPE_3_PLUS',
  INSURANCE_TYPES_UNSPECIFIED = 'INSURANCE_TYPES_UNSPECIFIED',
}

export enum PaymentOption {
  FULL_PAYMENT,
  CREDIT_CARD_INSTALLMENT,
  RABBIT_CARE_INSTALLMENT,
}

export enum PaymentMethod {
  CASH,
  VEDC,
  ONLINECARD,
  WALLET,
  QR_CODE,
  DIRECT_DEBIT,
}

export interface CustomerInformation {
  leadId: string;
  humanId: string;
  // Policy Holder name or Company name
  customerName: string;
  orderType?: string;
  policyHolderType?: PolicyHolderType;
  // National ID or Company tax ID
  customerId?: string;
  policyAddress?: string;
  email?: string;
  phoneNumber?: string;
}

export interface QuoteInformation {
  premium?: string;
  productName?: string;
  productCategory?: string;
  healthQuoteInformation?: any;
  whtAmount: number;
  insurerName: string;
  insuranceKind: DownloadInsuranceKind;
  insuranceType?: InsuranceType;
  licensePlate: string;
  car: string;
  grossMandatoryPremium?: number;
  grossVoluntaryPremium: string | number;
  discount?: number;
  totalPremium: number;
  processingFee?: number;
  deliveryFee?: number;
  startDate?: string;
  endDate?: string;
}

interface CardProviders {
  name: string;
  installmentPlans: InstallmentPlan[];
  displayNameEn: string;
  displayNameTh: string;
  shortName: string;
}

export interface PaymentSelection {
  paymentOption: keyof typeof PaymentOption;
  paymentMethods: (keyof typeof PaymentMethod)[];
  installmentPlans: InstallmentPlan[];
  cardProviders: CardProviders[];
}

export interface InstallmentPlan {
  numberOfInstallments: number;
  firstMonthInstallment: number;
  nextMonthsInstallment: number;
}

export interface LeadPaymentInformation {
  healthQuoteInformation?: any;
  carQuoteInformation?: any;
  insurerName?: string;
  customerInformation: CustomerInformation;
  quoteInformation: QuoteInformation;
  paymentSelections: PaymentSelection[];
  paymentOptions: PaymentOptions;
  packageDetails: PackageDetails;
  paymentDetails: {
    paidAmount: number;
    paidCharges: ChargeResponse[];
    referenceLeadId: string;
    additionalPaymentAmount: number;
    firstMonthRemainingAmount?: { amount: number };
    firstMonthSurplusAmount?: { amount: number };
    availableCreditShell?: number;
    totalCreditUsed?: number;
  };
}

interface Credit {
  name: string;
  money: Money;
  status: string;
  createTime: string; // ISO date string
  updateTime: string; // ISO date string
  deleteTime: string | null; // ISO date string or null
}

interface ParentLeadPayment {
  lead: string;
  paidCharges: any[];
  refunds: any[];
  credits: any[];
}

interface Money {
  currencyCode: string;
  amount: string;
}

export interface NewLeadPaymentInformation {
  totalCreditAvailable?: { amount: string };
  totalCreditUsed?: { amount: string };
  quote: string;
  paidCharges: ChargeResponse[];
  refunds: any[];
  parentLeadPayment: ParentLeadPayment;
  totalPaidAmount: Money;
  totalRefundedAmount: Money;
  totalPayableAmount: Money;
  termUnpaidAmount: Money;
  term: number;
  credits: Credit[];
  totalCreditAmount: Money;
}

export interface PackageDetails {
  paymentOption: string;
  paymentMethod: string;
  numberOfInstallments: number;
  cardProvider: string;
  priceDetails: PriceDetail;
}

export interface PaymentOptions {
  fullPayment: FullPayment | null;
  rabbitCareInstallment: RabbitCareInstallment | null;
  creditCardInstallment: CreditCardInstallment | null;
}

export interface FullPayment {
  packagePrice: PackagePrice;
  paymentDetails: PaymentDetail[];
}

export interface RabbitCareInstallment {
  packagePrice: PackagePrice;
  availablePlans: number[];
  installmentPlans: InstallmentPlanV2[];
  directDebitProviders: CardProvider[];
}

export interface CreditCardInstallment {
  packagePrice: PackagePrice;
  cardProviders: CardProvider[];
}

interface CardProvider {
  name: string;
  installmentPlans: InstallmentPlanV2[];
  displayNameEn: string;
  displayNameTh: string;
  shortName: string;
  minimumAmount: string;
  availablePlans: number[];
}

export interface InstallmentPlanV2 {
  numberOfInstallment: number;
  paymentDetails: PaymentDetail[];
}

export interface PackagePrice {
  voluntaryPrice: string;
  compulsoryPrice: string;
  totalPrice: string;
  discountPrice?: string;
}

export interface PaymentDetail {
  paymentMethod: keyof typeof PaymentMethod;
  paymentAmount: PaymentAmount;
  paymentBreakdowns: PaymentBreakdown[];
  priceSummary: PriceSummary;
  installmentDetail: InstallmentDetail[];
}

export interface PaymentAmount {
  interestFeePercentage: number;
  interestFeeAmount: string;
  processingFeePercentage: number;
  processingFeeAmount: string;
  feePercentage: number;
  feeAmount: string;
  discountPercentage: number;
  discountAmount: string;
  netDiscountPercentage: number;
  netDiscountAmount: string;
  packagePriceAfterDiscount: string;
  netPremiumAmount: string;
  firstMonth: string;
  nextMonths: string;
  grandTotal: string;
}

export interface PaymentBreakdown {
  period: number;
  paymentAmount: string;
  principal: string;
  addOns: string;
  interest: string;
  processingFee: string;
  principalBalance: string;
  interestBalance: string;
  processingFeeBalance: string;
  totalBalance: string;
}

export interface CommonSelectOption {
  label: string;
  value: string;
  type?: 'date' | 'text' | 'number' | 'select' | 'multiSelect';
  options?: { label: string; value: string }[];
  placeholder?: string;
  tab?: string;
}
