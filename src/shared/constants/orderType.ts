import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';

export enum OrderType {
  All = 'ALL',
  Document = 'DOCUMENT',
  QC = 'QC',
  Submission = 'SUBMISSION',
  Approval = 'APPROVAL',
  PrintingAndShipping = 'PRINTING_AND_SHIPPING',
  Travel = 'TRAVEL',
}

// ORDER-1084 - Updated Statuses
// document_statuses - for policy
export enum ItemDocumentStatus {
  PENDING = 'ITEM_DOCUMENT_STATUS_PENDING',
  COMPLETE = 'ITEM_DOCUMENT_STATUS_COMPLETE',
  FAILED = 'ITEM_DOCUMENT_STATUS_FAILED',
}

// document_statuses - for order
export enum OrderDocumentStatus {
  PENDING = 'DOCUMENT_STATUS_PENDING',
  COMPLETE = 'DOCUMENT_STATUS_COMPLETE',
  FAILED = 'DOCUMENT_STATUS_FAILED',
}

// qc_statuses - for policy
export enum ItemQcStatus {
  PENDING = 'ITEM_QC_STATUS_PENDING',
  PREAPPROVED = 'ITEM_QC_STATUS_PREAPPROVED',
  APPROVED = 'ITEM_QC_STATUS_APPROVED',
  REJECTED = 'ITEM_QC_STATUS_REJECTED',
}

// qc_statuses - for order
export enum OrderQcStatus {
  PENDING = 'QC_STATUS_PENDING',
  PREAPPROVED = 'QC_STATUS_PREAPPROVED',
  APPROVED = 'QC_STATUS_APPROVED',
  REJECTED = 'QC_STATUS_REJECTED',
}

// submission_statuses - for policy
export enum ItemSubmissionStatus {
  PENDING = 'ITEM_SUBMISSION_STATUS_PENDING',
  PRESUBMITTED = 'ITEM_SUBMISSION_STATUS_PRESUBMITTED',
  READY_TO_SUBMIT = 'ITEM_SUBMISSION_STATUS_READY_TO_SUBMIT',
  SUBMITTED = 'ITEM_SUBMISSION_STATUS_SUBMITTED',
  MISSED_DEADLINE = 'ITEM_SUBMISSION_STATUS_MISSED_DEADLINE',
}

// approval_statuses - for policy
export enum ItemApprovalStatus {
  PENDING = 'ITEM_APPROVAL_STATUS_PENDING',
  APPROVED = 'ITEM_APPROVAL_STATUS_APPROVED',
  REJECTED = 'ITEM_APPROVAL_STATUS_REJECTED',
  POLICY_UPLOADED = 'ITEM_APPROVAL_STATUS_POLICY_UPLOADED',
  SUBMISSION_PROBLEM = 'ITEM_APPROVAL_STATUS_SUBMISSION_PROBLEM',
}

// shipment_statuses - for policy
export enum ItemPrintingAndShippingStatus {
  POLICY_READY = 'POLICY_READY',
  POLICY_NOT_READY = 'POLICY_NOT_READY',
  POLICY_SHIPPED = 'POLICY_SHIPPED',
}

// shipment_statuses - for shipment
export enum ShipmentStatus {
  NOT_SHIPPED = 'SHIPMENT_STATUS_NOT_SHIPPED',
  SHIPPED_OUT = 'SHIPMENT_STATUS_SHIPPED_OUT',
  DELIVERED = 'SHIPMENT_STATUS_DELIVERED',
  DELIVERY_FAILED = 'SHIPMENT_STATUS_DELIVERY_FAILED',
}

export enum MotoTypes {
  MOTOR_TYPE_1 = 'MOTOR_TYPE_1',
  MOTOR_TYPE_2 = 'MOTOR_TYPE_2',
  MOTOR_TYPE_2_PLUS = 'MOTOR_TYPE_2_PLUS',
  MOTOR_TYPE_3 = 'MOTOR_TYPE_3',
  MOTOR_TYPE_3_PLUS = 'MOTOR_TYPE_3_PLUS',
  MOTOR_TYPE_COMPULSORY = 'MOTOR_TYPE_COMPULSORY',
  MOTOR_TYPE_MANDATORY = 'MOTOR_TYPE_MANDATORY',
  MOTOR_TYPE_UNSPECIFIED = 'MOTOR_TYPE_UNSPECIFIED',
}

export enum PrintingAndShippingPaymentTypes {
  ONE_TIME_PAYMENT = 'ONE_TIME_PAYMENT',
  CREDIT_CARD_INSTALLMENT = 'CREDIT_CARD_INSTALLMENT',
  RABBIT_CARE_INSTALLMENT = 'RABBIT_CARE_INSTALLMENT',
}

export enum PrintingAndShippingStatus {
  ITEM_PRINTING_AND_SHIPPING_STATUS_DOCUMENT_UPLOAD = 'ITEM_PRINTING_AND_SHIPPING_STATUS_DOCUMENT_UPLOAD',
  ITEM_PRINTING_AND_SHIPPING_STATUS_PENDING = 'ITEM_PRINTING_AND_SHIPPING_STATUS_PENDING',
  ITEM_PRINTING_AND_SHIPPING_STATUS_PRINTED = 'ITEM_PRINTING_AND_SHIPPING_STATUS_PRINTED',
  ITEM_PRINTING_AND_SHIPPING_STATUS_WAITING_PAYMENT = 'ITEM_PRINTING_AND_SHIPPING_STATUS_WAITING_PAYMENT',
}

export enum PrintingAndShippingPaymentStatus {
  PAYMENT_STATUS_PENDING = 'PAYMENT_STATUS_PENDING',
  PAYMENT_STATUS_FAILED = 'PAYMENT_STATUS_FAILED',
  PAYMENT_STATUS_SUCCESSFUL = 'PAYMENT_STATUS_SUCCESSFUL',
  PAYMENT_STATUS_EXPIRED = 'PAYMENT_STATUS_EXPIRED',
  PAYMENT_STATUS_REJECTED = 'PAYMENT_STATUS_REJECTED',
}

export enum PackageType {
  STANDARD = 'STANDARD',
  RENEWAL = 'RENEWAL',
  TRANSFER_CODE = 'TRANSFER_CODE',
}

export enum CarRepairType {
  CAR_REPAIR_TYPES_UNSPECIFIED = 'CAR_REPAIR_TYPES_UNSPECIFIED',
  GARAGE = 'GARAGE',
  DEALER = 'DEALER',
}

export enum ShippingMethods {
  IN_PERSON = 'InPerson',
  EMAIL = 'Email',
  COURIER = 'Courier',
}

export enum ShipmentMethods {
  SHIPMENT_METHOD_DIGITAL = 'SHIPMENT_METHOD_DIGITAL',
  SHIPMENT_METHOD_EMAIL = 'SHIPMENT_METHOD_EMAIL',
  SHIPMENT_METHOD_COURIER = 'SHIPMENT_METHOD_COURIER',
}

export const AdminRoles: UserRoleID[] = [
  UserRoleID.Admin,
  UserRoleID.SuperAdmin,
  UserRoleID.Supervisor,
  UserRoleID.Manager,
];

export enum NewShippingMethods {
  DIGITAL_DELIVERY = 'DigitalDelivery',
  EXPRESS_DELIVERY = 'ExpressDelivery',
  STANDARD_DELIVERY = 'StandardDelivery',
  EXPRESS_DELIVERY_DASHCAM = 'ExpressDeliveryDashcam',
}

export enum ShipmentProviders {
  EMAIL = 'deliveryOptions/digital-delivery',
  COURIER_PROVIDER_KERRY = 'deliveryOptions/kerry-standard',
  COURIER_PROVIDER_KERRY_EXPRESS = 'deliveryOptions/kerry-express',
  COURIER_PROVIDER_KERRY_EXPRESS_DASHCAM = 'deliveryOptions/kerry-express-dashcam',
}

export enum AddOnTypes {
  ASSET = 'ASSET',
  ROADSIDE_ASSISTANCE = 'ROADSIDE_ASSISTANCE',
  CAR_REPLACEMENT = 'CAR_REPLACEMENT',
}

export enum CancellationReasons {
  CUSTOMER_CANCEL_CHANGE_IN_PREMIUM = 'customer_cancel_change_in_premium',
  CUSTOMER_CANCEL_CAR_SOLD = 'customer_cancel_car_sold',
  CUSTOMER_CANCEL_REFINANCE = 'customer_cancel_refinance',
  CUSTOMER_CANCEL_OTHER = 'customer_cancel_other',
  INSPECTION_ISSUE_INSURER_REQUIRED_CAR_REPAIR_FIRST = 'inspection_issue_insurer_required_car_repair_first',
  INSPECTION_ISSUE_CUSTOMER_NOT_ACCEPT_EXISTING_DAMAGE = 'inspection_issue_customer_not_accept_existing_damage',
  INSPECTION_ISSUE_CUSTOMER_CANNOT_BE_REACHED = 'inspection_issue_customer_cannot_be_reached',
  INSPECTION_ISSUE_CUSTOMER_CANNOT_HAVE_CAR_INSPECTION = 'inspection_issue_customer_cannot_have_car_inspection',
  INSPECTION_ISSUE_COORDINATION_ISSUE = 'inspection_issue_coordination_issue',
  INSPECTION_ISSUE_OTHER = 'inspection_issue_inspection_issue_other',
  INSURER_REJECTED_INCORRECT_CAR_USAGE = 'insurer_rejected_incorrect_car_usage',
  INSURER_REJECTED_INSURER_REQUIRED_CAR_REPAIR_FIRST = 'insurer_rejected_insurer_required_car_repair_first',
  INSURER_REJECTED_NOT_PASS_CAR_INSPECTION = 'insurer_rejected_not_pass_car_inspection',
  INSURER_REJECTED_TRUCK_ACCESSORIES = 'insurer_rejected_truck_accessories',
  INSURER_REJECTED_SPEED_ACCESSORY_ISSUE = 'insurer_rejected_speed_accessory_issue',
  INSURER_REJECTED_MAZDA2_MOU_ISSUE = 'insurer_rejected_mazda2_mou_issue',
  INSURER_REJECTED_EXCEED_CAR_YEAR = 'insurer_rejected_exceed_car_year',
  INSURER_REJECTED_EXPIRED_PACKAGE = 'insurer_rejected_expired_package',
  INSURER_REJECTED_CLAIM_RECORD_ISSUE = 'insurer_rejected_claim_record_issue',
  INSURER_REJECTED_DOES_NOT_MATCH_INSURANCE_CRITERIA = 'insurer_rejected_does_not_match_insurance_criteria',
  INSURER_REJECTED_INCORRECT_PACKAGE = 'insurer_rejected_incorrect_package',
  INSURER_REJECTED_COVERAGE_DATE_CHANGE = 'insurer_rejected_coverage_date_change',
  INSURER_REJECTED_OTHER = 'insurer_rejected_other',
  CUSTOMER_CANCEL_CHANGE_COVERAGE = 'customer_cancel_change_coverage',
  CUSTOMER_CANCEL_CHANGE_INSURER = 'customer_cancel_change_insurer',
  CUSTOMER_CANCEL_DISSATISFIED = 'customer_cancel_dissatisfied',
  CUSTOMER_CANCEL_AGENT_OFFERED = 'customer_cancel_agent_offered',
  INSURER_REJECTED_AGENT_OFFERED = 'insurer_rejected_agent_offered',
  ACCOUNTING_CANCEL_FAIL = 'accounting_cancel_fail',
}
