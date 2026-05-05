import _zip from 'lodash/zip';
import { getI18n } from 'react-i18next';

import { Item } from 'data/slices/orderPolicySlice/interface';
import { getString } from 'presentation/theme/localization';
import {
  MotoTypes,
  PrintingAndShippingStatus,
  OrderDocumentStatus,
  ItemDocumentStatus,
  OrderQcStatus,
  ItemQcStatus,
  ItemSubmissionStatus,
  ItemApprovalStatus,
  ShipmentStatus,
} from 'shared/constants/orderType';
import { IPageState } from 'shared/interfaces/common/table';
import { Addons } from 'shared/types/addons';
import { satangToBaht } from 'utils/currency';
import {
  differenceInDays,
  startOfDay,
  format,
  isValid,
  momentUTCEquivalent,
} from 'utils/datetime';

import { ITextStatus } from './TextStatus';

import { formatCoverage, formatSatang } from '../QcDetailPage/helpers/utils';

export interface Column {
  id: string;
  label: string;
  value?: string | number;
  field?: string;
  align?: 'right' | 'center' | 'left';
  format?: any;
  sorting?: 'none' | 'asc' | 'desc';
  noTooltip?: boolean;
  minWidth?: number;
  sortingField?: string;
  isNotSorting?: boolean;
}

interface OrderStatus {
  documentsStatus: ITextStatus;
  qcStatus: ITextStatus;
  submissionStatus: ITextStatus;
  approvalStatus: ITextStatus;
}

export interface Product extends OrderStatus {
  policyRef: string;
  policyHolder: string;
  productType: string;
  insurer: string;
  premium: string;
  humanId: string;
  isCancelled: boolean;
  name?: string;
  submissionBy?: string;
  approvalBy?: string;
  package: string;
  isAddon: boolean;
}

export interface Order extends OrderStatus {
  id: string;
  orderId: string;
  assignedTo?: string;
  customer: string;
  website: string;
  paymentTerms: string;
  discount: number;
  paymentStatus: string;
  totalNetPremium: string;
  leadSource: string;
  isStar: boolean;
  products: Product[];
  isChecked: boolean;
  warningLbl?: string;
  licensePlate?: string;
  insuredPerson?: string;
  chassisNumber?: string;
  orderLink?: string;
  name?: string;
  hasLink?: boolean;
  items?: ProductItem[];
  isCompany?: boolean;
  companyName?: string;
}

export interface Approval {
  id: string;
  policyId: string;
  assignedTo: string;
  createdOn: string;
  insuranceCategory: string;
  productType: string;
  insurerSearchLabel: string;
  customerPolicyholder: string;
  totalNetPremium: string;
  paymentTerms: string;
  paymentStatus: ITextStatus;
  documentStatus: ITextStatus;
  qcStatus: ITextStatus;
  submissionStatus: ITextStatus;
  approvalStatus: ITextStatus;
  isStar: boolean;
  isChecked: boolean;
}

export interface ProductItem {
  addons?: any[];
  approvalStatus?: string;
  discounts?: any[];
  documentStatus?: string;
  grossPremium?: string;
  motorItemType?: string;
  name?: string;
  netPremium?: string;
  package?: string;
  price?: string;
  product?: string;
  qcStatus?: string;
  stampDuty?: string;
  stampDutyPercentage?: number;
  submissionStatus?: string;
  vatAmount?: string;
  vatPercent?: number;
  insurer: string;
  humanId?: string;
  isCancelled?: boolean;
}

export interface CustomerIProps {
  firstName?: string;
  lastName?: string;
}

export type PolicyTableType = 'all' | 'approval' | 'submission' | 'shipment';

const INSURANCE_PACKAGE_ORDER = [
  MotoTypes.MOTOR_TYPE_COMPULSORY,
  MotoTypes.MOTOR_TYPE_MANDATORY,
  MotoTypes.MOTOR_TYPE_1,
  MotoTypes.MOTOR_TYPE_2_PLUS,
  MotoTypes.MOTOR_TYPE_3_PLUS,
  MotoTypes.MOTOR_TYPE_2,
  MotoTypes.MOTOR_TYPE_3,
  MotoTypes.MOTOR_TYPE_UNSPECIFIED,
] as string[];

export const ITEM_PER_PAGE_LIST = [15, 25, 50, 75, 100];

const applicationNumberColumn: Column = {
  id: 'applicationNumber',
  minWidth: 130,
  label: 'searchFieldOrderOption.applicationNumber',
};

export const columnSettings: Column[] = [
  {
    id: 'orderId',
    minWidth: 100,
    label: 'leadDetailFields.orderId',
    sortingField: 'order.humanId',
    sorting: 'none',
  },
  {
    id: 'earliestPolicyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sortingField: 'attributes.earliestPolicyStartDate',
    sorting: 'asc',
  },
  {
    id: 'insurancePackage',
    minWidth: 120,
    label: 'tableListing.insurancePackage',
    isNotSorting: true,
  },
  {
    id: 'deliveryOption',
    minWidth: 150,
    label: 'tableListing.deliveryOption',
    isNotSorting: true,
  },
  {
    id: 'totalInvoiced',
    minWidth: 120,
    label: 'tableListing.totalInvoiced',
    isNotSorting: true,
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
    isNotSorting: true,
  },
  {
    id: 'licensePlate',
    minWidth: 120,
    label: 'text.licensePlate',
    isNotSorting: true,
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
    sortingField: 'order.createTime',
    sorting: 'none',
  },
  {
    id: 'salesAgent',
    minWidth: 210,
    label: 'tableListing.salesAgent',
    isNotSorting: true,
  },
  {
    id: 'paymentStatus',
    minWidth: 150,
    label: 'text.paymentStatus',
    isNotSorting: true,
  },
  {
    id: 'documentStatus',
    minWidth: 130,
    label: 'text.documentStatus',
    sortingField: 'order.documentStatus',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'qcStatus',
    minWidth: 130,
    label: 'text.qcStatus',
    sortingField: 'order.qcStatus',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'shippingAddress',
    minWidth: 230,
    label: 'healthLead.shippingAddress',
    sortingField: 'order.shippingAddress',
    isNotSorting: true,
    sorting: 'none',
  },
];

export const columnDocumentsQC: Column[] = [
  {
    id: 'orderId',
    minWidth: 120,
    label: 'leadDetailFields.orderId',
    sortingField: 'order.humanId',
    sorting: 'none',
  },
  {
    id: 'policyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sortingField: 'attributes.earliestPolicyStartDate',
    sorting: 'asc',
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
    isNotSorting: true,
  },
  {
    id: 'deliveryOption',
    minWidth: 150,
    label: 'tableListing.deliveryOption',
    isNotSorting: true,
  },
  {
    id: 'licensePlate',
    minWidth: 120,
    label: 'text.licensePlate',
    isNotSorting: true,
  },
  {
    id: 'insurancePackage',
    minWidth: 120,
    label: 'tableListing.insurancePackage',
    isNotSorting: true,
  },
  {
    id: 'assignedTo',
    minWidth: 210,
    label: 'text.assignedTo',
    isNotSorting: true,
  },
  {
    id: 'documentStatus',
    minWidth: 130,
    label: 'text.documentStatus',
    sortingField: 'order.documentStatus',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'qcStatus',
    minWidth: 130,
    label: 'text.qcStatus',
    sortingField: 'order.qcStatus',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'paymentStatus',
    minWidth: 130,
    label: 'text.paymentStatus',
    sortingField: 'order.isFullyPaid',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'totalInvoiced',
    minWidth: 130,
    label: 'tableListing.totalInvoiced',
    sortingField: 'order.invoicePrice',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'salesAgent',
    minWidth: 210,
    label: 'tableListing.salesAgent',
    isNotSorting: true,
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
    sortingField: 'order.createTime',
    sorting: 'none',
  },
];

export const columnQC: Column[] = [
  ...columnDocumentsQC.slice(0, 1),
  {
    id: 'policyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sortingField: 'attributes.earliestPolicyStartDate',
    sorting: 'asc',
  },
  ...columnDocumentsQC.slice(2, 7),
  {
    id: 'timeSinceDocumentsComplete',
    minWidth: 120,
    label: 'tableListing.timeSinceDocumentsComplete',
    isNotSorting: true,
  },
  ...columnDocumentsQC.slice(7),
];

// for submission listing view
export const columnApproval: Column[] = [
  {
    id: 'orderId',
    minWidth: 120,
    label: 'leadDetailFields.orderId',
  },
  {
    id: 'policyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
  },
  {
    id: 'licensePlate',
    minWidth: 120,
    label: 'text.licensePlate',
  },
  {
    id: 'insuranceCompany',
    minWidth: 150,
    label: 'tableListing.insuranceCompany',
  },
  {
    id: 'insuranceType',
    minWidth: 120,
    label: 'tableListing.insuranceType',
  },
  {
    id: 'grossPremium',
    minWidth: 130,
    label: 'tableListing.grossPremium',
  },
  {
    id: 'assignedTo',
    minWidth: 130,
    label: 'text.assignedTo',
  },
  {
    id: 'documentsStatus',
    minWidth: 130,
    label: 'text.documentStatus',
  },
  {
    id: 'qcStatus',
    minWidth: 130,
    label: 'text.qcStatus',
  },
  {
    id: 'timeSinceQCApproved',
    minWidth: 120,
    label: 'tableListing.timeSinceQCApproved',
  },
  {
    id: 'approvalStatus',
    minWidth: 130,
    label: 'text.approvalStatus',
  },
  {
    id: 'submissionStatus',
    minWidth: 220,
    label: 'text.submissionStatus',
  },
  {
    id: 'paymentStatus',
    minWidth: 130,
    label: 'text.paymentStatus',
  },
  {
    id: 'salesAgent',
    minWidth: 210,
    label: 'tableListing.salesAgent',
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
  },
];

// for approval listing view
export const columnPolicyApproval = [
  ...columnApproval.slice(0, 9),
  {
    id: 'submissionStatus',
    minWidth: 220,
    label: 'text.submissionStatus',
  },
  {
    id: 'submissionMethod',
    minWidth: 120,
    label: 'tableListing.submissionMethod',
  },
  {
    id: 'timeSinceSubmission',
    minWidth: 120,
    label: 'tableListing.timeSinceSubmission',
  },
  {
    id: 'paymentStatus',
    minWidth: 130,
    label: 'text.paymentStatus',
  },
  ...columnApproval.slice(12),
  {
    id: 'orderSubmitted',
    minWidth: 120,
    label: 'tableListing.orderSubmitted',
  },
];

export const shippingPoliciesColumnSetting: Column[] = [
  {
    id: 'checkbox',
    label: '',
  },
  {
    id: 'policyId',
    minWidth: 130,
    label: 'text.policies',
  },
  {
    id: 'detailView',
    label: '',
  },
  {
    id: 'policyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
  },
  // combine insurer and policy type
  {
    id: 'insurancePackage',
    minWidth: 165,
    label: 'text.insurancePackage',
  },
  {
    id: 'submissionStatus',
    minWidth: 130,
    label: 'text.submissionStatus',
  },
  {
    id: 'approvalStatus',
    minWidth: 130,
    label: 'text.approvalStatus',
  },
  {
    id: 'deliveredByEmail',
    minWidth: 130,
    label: 'tableListing.lastDeliveredByEmail',
  },
  {
    id: 'deliveredByCourier', // Kerry Express etc.
    minWidth: 130,
    label: 'tableListing.lastDeliveredByKerryExpress',
  },
  {
    id: 'trackingNumber',
    minWidth: 130,
    label: 'tableListing.kerryExpressTrackingNumber',
  },
  applicationNumberColumn,
];

export const productColumnSettings: Column[] = [
  shippingPoliciesColumnSetting[1],
  ...shippingPoliciesColumnSetting.slice(3, 5),
  {
    id: 'premium',
    minWidth: 130,
    label: 'qc.premium',
  },
  ...shippingPoliciesColumnSetting.slice(5),
];

const assignedToColumn: Column = {
  id: 'assignedTo',
  minWidth: 130,
  label: 'text.assignedTo',
};

export const approvalPoliciesColumnSetting: Column[] = [
  ...shippingPoliciesColumnSetting.slice(0, 7),
  assignedToColumn,
  applicationNumberColumn,
];

export const submissionPoliciesColumnSetting: Column[] = [
  ...approvalPoliciesColumnSetting.slice(0, 6),
  assignedToColumn,
  applicationNumberColumn,
];

export const printingAndShippingSetting: Column[] = [
  {
    id: 'orderId',
    minWidth: 120,
    label: 'tableListing.pritingAndShippingOrderId',
    sortingField: 'order.humanId',
    sorting: 'none',
  },
  {
    id: 'earliestPolicyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sortingField: 'attributes.earliestPolicyStartDate',
    sorting: 'asc', // policy start date should sort by descending(recent one top), but changeSortStatus calculate sort status depending on current one(none -> asc -> desc).
  },
  {
    id: 'insurancePackage',
    minWidth: 120,
    label: 'tableListing.insurancePackage',
    isNotSorting: true,
  },
  {
    id: 'deliveryOption',
    minWidth: 150,
    label: 'tableListing.deliveryOption',
    isNotSorting: true,
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
    isNotSorting: true,
  },
  {
    id: 'licensePlate',
    minWidth: 150,
    label: 'text.licensePlate',
    isNotSorting: true,
  },
  {
    id: 'paymentStatus',
    minWidth: 120,
    label: 'text.paymentStatus',
    isNotSorting: true,
  },
  {
    id: 'shipmentFee',
    minWidth: 120,
    label: 'text.shipmentFee',
    sortingField: 'order.data.shipmentFee',
    sorting: 'none',
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
    sortingField: 'order.createTime',
    sorting: 'none',
  },
  {
    id: 'salesAgent',
    minWidth: 120,
    label: 'tableListing.salesAgent',
    isNotSorting: true,
  },
];

export const approvalColumnSetting: Column[] = [
  ...printingAndShippingSetting.slice(0, 4),
  ...printingAndShippingSetting.slice(4, 7),
  {
    id: 'documentsStatus',
    minWidth: 130,
    label: 'text.documentStatus',
  },
  {
    id: 'qcStatus',
    minWidth: 130,
    label: 'text.qcStatus',
  },
  ...printingAndShippingSetting.slice(8),
];

export const salesColumnSettings: Column[] = [
  {
    id: 'orderId',
    minWidth: 100,
    label: 'leadDetailFields.orderId',
    sortingField: 'order.humanId',
    sorting: 'none',
  },
  {
    id: 'earliestPolicyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sortingField: 'attributes.earliestPolicyStartDate',
    sorting: 'asc',
  },
  {
    id: 'policyStartDate',
    minWidth: 150,
    label: 'tableListing.policyStartDate',
    sorting: 'asc',
    sortingField: 'items.policyStartDate',
  },
  {
    id: 'documentStatus',
    minWidth: 130,
    label: 'text.documentStatus',
    sortingField: 'order.documentStatus',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'qcStatus',
    minWidth: 130,
    label: 'text.qcStatus',
    sortingField: 'order.qcStatus',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'shippingAddress',
    minWidth: 230,
    label: 'healthLead.shippingAddress',
    sortingField: 'order.shippingAddress',
    isNotSorting: true,
    sorting: 'none',
  },
  {
    id: 'totalInvoiced',
    minWidth: 120,
    label: 'tableListing.totalInvoiced',
    isNotSorting: true,
  },
  {
    id: 'paymentStatus',
    minWidth: 150,
    label: 'text.paymentStatus',
    isNotSorting: true,
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
    isNotSorting: true,
  },
  {
    id: 'licensePlate',
    minWidth: 120,
    label: 'text.licensePlate',
    isNotSorting: true,
  },
  {
    id: 'insurancePackage',
    minWidth: 120,
    label: 'tableListing.insurancePackage',
    isNotSorting: true,
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
    sortingField: 'order.createTime',
    sorting: 'none',
  },
  {
    id: 'salesAgent',
    minWidth: 210,
    label: 'tableListing.salesAgent',
    isNotSorting: true,
  },
  {
    id: 'deliveryOption',
    minWidth: 150,
    label: 'tableListing.deliveryOption',
    isNotSorting: true,
  },
];

// to reduce the improper use of named column settings.
export const submissionColumnSetting: Column[] = [...approvalColumnSetting];

export const summaryOrderColumnSettings: Column[] = [
  { id: 'subtotal', label: 'text.subTotal', value: '13,350' },
  { id: 'voucherDiscount', label: 'text.voucherDiscount', value: '1,200' },
  { id: 'total', label: 'text.total', value: '12,150' },
];

export const DEFAULT_PER_PAGE_TABLE = 15;

export const initialPageState: IPageState = {
  currentPage: 1,
  pageSize: 15,
};

export const formatDocumentStatus = (status: string | undefined) => {
  const trans = (key: string) => getString(`documentStatus.${key}`);
  switch (status) {
    case OrderDocumentStatus.PENDING:
    case ItemDocumentStatus.PENDING:
      return {
        label: trans('pending'),
        status: 'PENDING',
        type: 'text',
      };
    case OrderDocumentStatus.COMPLETE:
    case ItemDocumentStatus.COMPLETE:
      return {
        label: trans('complete'),
        status: 'COMPLETE',
        type: 'text',
      };
    case OrderDocumentStatus.FAILED:
    case ItemDocumentStatus.FAILED:
      return {
        label: trans('failed'),
        status: 'FAILED',
        type: 'text',
      };
    default:
      return {
        label: '-',
        status: 'text',
        type: 'text',
      };
  }
};

export const formatQCStatus = (status: string | undefined) => {
  const trans = (key: string) => getString(`qcStatus.${key}`);
  switch (status) {
    case OrderQcStatus.PENDING:
    case ItemQcStatus.PENDING:
      return {
        label: trans('pending'),
        status: 'PENDING',
        type: 'text',
      };
    case OrderQcStatus.PREAPPROVED:
    case ItemQcStatus.PREAPPROVED:
      return {
        label: trans('preApproved'),
        status: 'PREAPPROVED',
        type: 'text',
      };
    case OrderQcStatus.APPROVED:
    case ItemQcStatus.APPROVED:
      return {
        label: trans('approved'),
        status: 'APPROVED',
        type: 'text',
      };
    case OrderQcStatus.REJECTED:
    case ItemQcStatus.REJECTED:
      return {
        label: trans('rejected'),
        status: 'REJECTED',
        type: 'text',
      };
    default:
      return {
        label: '-',
        status: 'text',
        type: 'text',
      };
  }
};

export const formatSubmissionStatus = (status?: string, isAddon = false) => {
  const trans = (key: string) => getString(`submissionStatus.${key}`);
  switch (status) {
    case ItemSubmissionStatus.PENDING:
      return {
        label: trans('pending'),
        status: 'PENDING',
        type: 'text',
      };
    case ItemSubmissionStatus.PRESUBMITTED:
      return {
        label: trans('preSubmitted'),
        status: 'PRESUBMITTED',
        type: 'text',
      };
    case ItemSubmissionStatus.SUBMITTED:
      return {
        label: !isAddon ? trans('submitted') : trans('addOns.submitted'),
        status: 'SUBMITTED',
        type: 'text',
      };
    case ItemSubmissionStatus.READY_TO_SUBMIT:
      return {
        label: trans('readyToSubmit'),
        status: 'READY_TO_SUBMIT',
        type: 'text',
      };
    case ItemSubmissionStatus.MISSED_DEADLINE:
      return {
        label: trans('missedDeadline'),
        status: 'MISSED_DEADLINE',
        type: 'text',
      };
    default:
      return {
        label: '-',
        status: 'text',
        type: 'text',
      };
  }
};

export const formatApprovalStatus = (status?: string, isAddon = false) => {
  const trans = (key: string) => getString(`approveStatus.${key}`);
  switch (status) {
    case ItemApprovalStatus.PENDING:
      return {
        label: trans('pending'),
        status: 'PENDING',
        type: 'text',
      };
    case ItemApprovalStatus.APPROVED:
      return {
        label: !isAddon ? trans('approved') : trans('addOns.approved'),
        status: 'APPROVED',
        type: 'text',
      };
    case ItemApprovalStatus.REJECTED:
      return {
        label: trans('rejected'),
        status: 'REJECTED',
        type: 'text',
      };
    case ItemApprovalStatus.SUBMISSION_PROBLEM:
      return {
        label: getString('text.submissionProblem'),
        status: 'SUBMISSION_PROBLEM',
        type: 'text',
      };
    case ItemApprovalStatus.POLICY_UPLOADED:
      return {
        label: !isAddon
          ? trans('policyUploaded')
          : trans('addOns.policyUploaded'),
        status: 'POLICY_UPLOADED',
        type: 'text',
      };
    default:
      return {
        label: trans('unspecified'),
        status: 'UNSPECIFIED',
        type: 'text',
      };
  }
};

export const formatPrintingStatus = (status: string | undefined) => {
  const translate = (key: string) =>
    getString(`printingAndShippingStatus.${key}`);
  switch (status) {
    case PrintingAndShippingStatus.ITEM_PRINTING_AND_SHIPPING_STATUS_DOCUMENT_UPLOAD:
      return {
        label: translate('docUpload'),
        status: 'WAITING_UPLOAD',
        type: 'text',
      };
    case PrintingAndShippingStatus.ITEM_PRINTING_AND_SHIPPING_STATUS_PENDING:
      return {
        label: translate('pending'),
        status: 'IN_PROGRESS',
        type: 'text',
      };
    case PrintingAndShippingStatus.ITEM_PRINTING_AND_SHIPPING_STATUS_WAITING_PAYMENT:
      return {
        label: translate('waitingPayment'),
        status: 'IN_PROGRESS',
        type: 'text',
      };
    case PrintingAndShippingStatus.ITEM_PRINTING_AND_SHIPPING_STATUS_PRINTED:
      return {
        label: translate('printed'),
        status: 'COMPLETE',
        type: 'text',
      };
    default:
      return {
        label: translate('unspecified'),
        status: 'UNSPECIFIED',
        type: 'text',
      };
  }
};

export const formatMotoType = (type: string | undefined) => {
  switch (type) {
    case MotoTypes.MOTOR_TYPE_1:
      return getString('motoType.type1');
    case MotoTypes.MOTOR_TYPE_2:
      return getString('motoType.type2');
    case MotoTypes.MOTOR_TYPE_2_PLUS:
      return getString('motoType.type2Plus');
    case MotoTypes.MOTOR_TYPE_3:
      return getString('motoType.type3');
    case MotoTypes.MOTOR_TYPE_3_PLUS:
      return getString('motoType.type3Plus');
    case MotoTypes.MOTOR_TYPE_COMPULSORY:
      return getString('motoType.typeMandatory');
    case MotoTypes.MOTOR_TYPE_MANDATORY:
      return getString('motoType.typeMandatory');
    case MotoTypes.MOTOR_TYPE_UNSPECIFIED:
      return getString('motoType.typeUnspecified');
    default:
      return '';
  }
};

export const formatOrderItem = (item: Partial<Item>, policyHolder: any) => {
  const isAddon = [
    Addons.ASSET,
    Addons.CAR_REPLACEMENT,
    Addons.ROADSIDE_ASSISTANCE,
  ].includes(item.package as any);
  return {
    ...item,
    policyHolder: `${policyHolder?.firstName} ${policyHolder?.lastName}`,
    productType: formatMotoType(item?.motorItemType),
    premium: formatCoverage(satangToBaht(item?.grossPremium ?? 0)),
    documentsStatus: formatDocumentStatus(item?.documentStatus),
    qcStatus: formatQCStatus(item?.qcStatus),
    submissionStatus: formatSubmissionStatus(item?.submissionStatus, isAddon),
    approvalStatus: formatApprovalStatus(item?.approvalStatus, isAddon),
    insurer: item.insurer,
    policyRef: item?.humanId,
    policyId: item?.humanId,
    insurancePackageType:
      formatMotoType(item?.motorItemType) === 'Mandatory'
        ? 'm'
        : formatMotoType(item?.motorItemType),
    applicationNumber: item?.applicationNumber ?? '-',
  };
};

export const getAgentName = (agent: any) => {
  if (!agent) {
    return '-';
  }
  return agent;
};

export const formatCustomerName = (customer: CustomerIProps) => {
  // eslint-disable-next-line eqeqeq
  if (customer?.firstName !== undefined && customer?.lastName !== undefined) {
    const customerName = `${customer?.firstName} ${customer?.lastName}`.trim();
    return customerName || '-';
  }
  return customer;
};

export const formatInsuredPerson = ({ firstName = '', lastName = '' }) =>
  `${firstName} ${lastName}`;

export const formatOrderInsurancePackage = (items: ProductItem[]) =>
  items.map((item) => {
    if (!item) return '';
    const { motorItemType } = item;
    if (
      motorItemType === MotoTypes.MOTOR_TYPE_COMPULSORY ||
      motorItemType === MotoTypes.MOTOR_TYPE_MANDATORY
    )
      return getString('motoType.typeMandatory') === 'Mandatory'
        ? 'm'
        : getString('motoType.typeMandatory');
    return formatMotoType(motorItemType).toLowerCase();
  });

const formatOrderSubmissionStatus = (items: ProductItem[]) => {
  const insurancePackages = formatOrderInsurancePackage(items);
  const submissionStatus = items.map((item) => {
    if (!item) return {};
    const { submissionStatus: status } = item;
    return formatSubmissionStatus(status);
  });

  return _zip(insurancePackages, submissionStatus);
};

export const formatInsuranceCompany = (insurer: any) => {
  const language = getI18n()?.language ?? 'en';
  if (!insurer) return '';
  if (language === 'th') return insurer.shortnameTh;
  return insurer.shortnameEn;
};

export const formatPolicyStartDate = (date: Date | undefined) => {
  if (date) {
    const dateDifference = Math.ceil(
      differenceInDays(startOfDay(new Date(date)), startOfDay(new Date()))
    );
    if (dateDifference === 0) {
      return getString('text.today');
    }
    if (dateDifference === 1) {
      return getString('text.tomorrow');
    }
    return `${dateDifference} ${getString('datePicker.days')}`;
  }
  return '-';
};

export const orderInsurancePackage = (items: ProductItem[]) =>
  INSURANCE_PACKAGE_ORDER.map((pkg) =>
    items?.find((item) => item.motorItemType === pkg)
  ).filter(Boolean) as ProductItem[];

export const formatOrderDocuments = (
  listOrderDocuments: any[],
  agentName: string
) =>
  listOrderDocuments.map((item: any) => ({
    id: item.order.name.split('/')[1],
    orderId: item.order.humanId,
    policyStartDate: formatPolicyStartDate(
      item.attributes?.earliestPolicyStartDate
    ),
    customer: formatCustomerName(item.customer),
    documentStatus: formatDocumentStatus(item.order.documentStatus),
    timeSinceDocumentsComplete: '-',
    qcStatus: formatQCStatus(item.order.qcStatus),
    submissionStatus: formatOrderSubmissionStatus(
      orderInsurancePackage(item?.items)
    ),
    approvalStatus: formatApprovalStatus(item.order.approvalStatus),
    insuredPerson: item?.order?.data?.policyHolder
      ? formatInsuredPerson(item?.order?.data?.policyHolder)
      : '-',
    licensePlate: item?.order?.data?.carLicensePlate,
    insurancePackage: formatOrderInsurancePackage(
      orderInsurancePackage(item?.items)
    ),
    convertBy: item?.order?.convertBy,
    orderCreated: item?.order?.createTime,
    products: item.items?.map((productItem: Item) =>
      formatOrderItem(productItem, item?.order?.data?.policyHolder)
    ),
    totalInvoiced: formatSatang(item?.order?.invoicePrice),
    assignedTo: getAgentName(item[agentName]),
    leadSource: item.attributes?.sourceDisplayName ?? '',
    // Mock some fields
    website: 'Motor',
    paymentTerms: 'One-time',
    paymentStatus: item?.order?.isFullyPaid
      ? getString('tableListing.fullyPaid')
      : getString('tableListing.notFullyPaid'),
    totalNetPremium: '2,000',
    isStar: false,
    isChecked: false,
    companyName: item?.order?.data?.policyHolder?.companyName ?? '',
    isCompany: item?.order?.data?.policyHolder?.isCompany ?? false,
  }));

export const formatOrderSubmission = (
  listOrderSubmisstion: any[],
  agentName: string
) =>
  listOrderSubmisstion.map((item: any) => ({
    id: item.item.name,
    orderId: item.item.humanId,
    policyStartDate: formatPolicyStartDate(item?.item?.policyStartDate),
    assignedTo: getAgentName(item[agentName]),
    licensePlate: item?.attributes?.carLicensePlate ?? 'nn-0003',
    createdOn:
      item.item.submitDate && isValid(new Date(item.item.submitDate))
        ? format(
            new Date(momentUTCEquivalent(new Date(item.item.submitDate))),
            'dd/MM/yyyy (HH:mm:ss)'
          )
        : '',
    insuranceCategory: 'Motor Insurance',
    insuranceType: formatMotoType(item.item.motorItemType).toLowerCase(),
    insuranceCompany: formatInsuranceCompany(item?.insurer),
    insuredPerson: item.attributes.policyHolder
      ? `${item.attributes.policyHolder.firstName} ${item.attributes.policyHolder.lastName}`
      : '-',
    grossPremium: (+item.item.grossPremium / 100)?.toFixed(2),
    totalNetPremium: item.item.netPremium,
    paymentTerms: 'One-time',
    convertBy: item?.convertBy ?? '',
    paymentStatus: '-',
    documentsStatus: formatDocumentStatus(item.item.documentStatus),
    orderCreated: item.item.createTime,
    qcStatus: formatQCStatus(item.item.qcStatus),
    timeSinceQCApproved: '-',
    submissionStatus: formatSubmissionStatus(item.item.submissionStatus),
    approvalStatus: formatApprovalStatus(item.item.approvalStatus),
    isCancelled: item?.item?.isCancelled,
    isStar: true,
    isChecked: false,
  }));

export const formatNumber = (total: string) => Number(total);

interface ColorCodeStatusProps {
  [key: string]: string[] | undefined;
}

export const getStatusFromCodeStatus = (
  status: string,
  ColorCodeStatus: ColorCodeStatusProps
) => {
  let result = 'normal';
  Object.entries(ColorCodeStatus).forEach(([key, value]) => {
    if (value?.includes(status)) {
      result = key;
    }
  });

  return result;
};

export const getColorCodeMapping = (tableType?: string) => {
  switch (tableType) {
    case 'order':
      return {
        success: [
          'COMPLETE',
          'APPROVED',
          'SUBMITTED',
          'POLICY_UPLOADED',
          'APPROVED',
          ItemApprovalStatus.APPROVED,
          ItemApprovalStatus.POLICY_UPLOADED,
        ],
        warning: ['PRESUBMITTED', 'PREAPPROVED', ItemApprovalStatus.PENDING],
        danger: [
          'REJECTED',
          'FAILED',
          'MISSED_DEADLINE',
          'SUBMISSION_PROBLEM',
          'CANCELLED',
          ItemApprovalStatus.SUBMISSION_PROBLEM,
          ItemApprovalStatus.REJECTED,
        ],
      };
    case 'discountsApproval':
    case 'approvalHistory':
      return {
        success: ['APPROVED'],
        warning: ['CANCELLED'],
        danger: ['REJECTED'],
      };
    case 'user':
      return {
        success: ['Active'],
      };
    default:
      return {
        success: [
          'COMPLETE',
          'APPROVED',
          'SUBMITTED',
          'POLICY_UPLOADED',
          'SUCCESSFUL',
          'PAID',
          'ACTIVE',
          getString('text.active'),
          getString('text.present'),
          getString('text.paid'),
          getString('paymentStatus.successful'),
          getString('carepay.refundStatus.successful'),
        ],
        warning: [
          'IN_PROGRESS',
          'WAITING_UPLOAD',
          'CANCELLED',
          'PENDING',
          getString('text.suspended'),
          getString('text.pending'),
          'PRESUBMITTED',
          'PREAPPROVED',
          'CANCELED_CHANGE_ORDER',
          getString('carepay.refundStatus.pending'),
        ],
        danger: [
          'ERROR',
          'REJECTED',
          'FAILED',
          'MISSED_DEADLINE',
          'SUBMISSION_PROBLEM',
          getString('text.absent'),
          'CANCELED',
          getString('carepay.refundStatus.failed'),
        ],
      };
  }
};

export const getStatusValue = (status: string, tableType?: string) => {
  const ColorCodeStatus = getColorCodeMapping(tableType ?? undefined);
  return getStatusFromCodeStatus(status, ColorCodeStatus);
};

export const getShipmentStatus = (status: string) => {
  let shipmentStatus: string;
  switch (status) {
    case ShipmentStatus.DELIVERED:
      shipmentStatus = getString('shipmentStatus.delivered');
      break;
    case ShipmentStatus.SHIPPED_OUT:
      shipmentStatus = getString('shipmentStatus.shippedOut');
      break;
    case ShipmentStatus.NOT_SHIPPED:
      shipmentStatus = getString('shipmentStatus.notShipped');
      break;
    default:
      shipmentStatus = '';
      break;
  }
  return shipmentStatus;
};

export const getAddonsTextByPackage = (productPkg: string) => {
  switch (productPkg) {
    case Addons.ASSET:
      return getString('order.addOns.carAssetCoverage');
    case Addons.CAR_REPLACEMENT:
      return getString('order.addOns.carReplacement');
    case Addons.ROADSIDE_ASSISTANCE:
      return getString('order.addOns.roadSideAssistance');
    default:
  }
  return '';
};
