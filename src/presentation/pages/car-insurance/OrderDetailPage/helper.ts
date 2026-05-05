import { getString } from 'presentation/theme/localization';
import { CancellationReasons } from 'shared/constants/orderType';

// eslint-disable-next-line import/prefer-default-export
export const cancellationReasons = () => [
  {
    id: 'customer_cancel_change_in_premium',
    value: CancellationReasons.CUSTOMER_CANCEL_CHANGE_IN_PREMIUM,
    title: getString('order.cancellationReasons.changeInPremium'),
    group: getString('order.cancellationReasons.customerCancel'),
  },
  {
    id: 'customer_cancel_car_sold',
    value: CancellationReasons.CUSTOMER_CANCEL_CAR_SOLD,
    title: getString('order.cancellationReasons.carSold'),
    group: getString('order.cancellationReasons.customerCancel'),
  },
  {
    id: 'customer_cancel_refinance',
    value: CancellationReasons.CUSTOMER_CANCEL_REFINANCE,
    title: getString('order.cancellationReasons.refinance'),
    group: getString('order.cancellationReasons.customerCancel'),
  },
  {
    id: 'customer_cancel_change_insurer',
    value: CancellationReasons.CUSTOMER_CANCEL_CHANGE_INSURER,
    title: getString('order.cancellationReasons.customerCancelChangeInsurer'),
    group: getString('order.cancellationReasons.customerCancel'),
    newOption: true,
  },
  {
    id: 'customer_cancel_change_coverage',
    value: CancellationReasons.CUSTOMER_CANCEL_CHANGE_COVERAGE,
    title: getString('order.cancellationReasons.customerCancelChangeCoverage'),
    group: getString('order.cancellationReasons.customerCancel'),
    newOption: true,
  },
  {
    id: 'customer_cancel_dissatisfied',
    value: CancellationReasons.CUSTOMER_CANCEL_DISSATISFIED,
    title: getString('order.cancellationReasons.customerCancelDissatisfied'),
    group: getString('order.cancellationReasons.customerCancel'),
    newOption: true,
  },
  {
    id: 'customer_cancel_agent_offered',
    value: CancellationReasons.CUSTOMER_CANCEL_AGENT_OFFERED,
    title: getString('order.cancellationReasons.customerCancelAgentOffered'),
    group: getString('order.cancellationReasons.customerCancel'),
    newOption: true,
  },
  {
    id: 'customer_cancel_other',
    value: CancellationReasons.CUSTOMER_CANCEL_OTHER,
    title: getString('order.cancellationReasons.customerOther'),
    group: getString('order.cancellationReasons.customerCancel'),
  },
  {
    id: 'inspection_issue_insurer_required_car_repair_first',
    value:
      CancellationReasons.INSPECTION_ISSUE_INSURER_REQUIRED_CAR_REPAIR_FIRST,
    title: getString('order.cancellationReasons.requiredCarRepairFirst'),
    group: getString('order.cancellationReasons.inspectionIssue'),
  },
  {
    id: 'inspection_issue_customer_not_accept_existing_damage',
    value:
      CancellationReasons.INSPECTION_ISSUE_CUSTOMER_NOT_ACCEPT_EXISTING_DAMAGE,
    title: getString('order.cancellationReasons.notAcceptExistingDamage'),
    group: getString('order.cancellationReasons.inspectionIssue'),
  },
  {
    id: 'inspection_issue_customer_cannot_be_reached',
    value: CancellationReasons.INSPECTION_ISSUE_CUSTOMER_CANNOT_BE_REACHED,
    title: getString('order.cancellationReasons.customerCannotBeReached'),
    group: getString('order.cancellationReasons.inspectionIssue'),
  },
  {
    id: 'inspection_issue_customer_cannot_have_car_inspection',
    value:
      CancellationReasons.INSPECTION_ISSUE_CUSTOMER_CANNOT_HAVE_CAR_INSPECTION,
    title: getString('order.cancellationReasons.cannotHaveCarInspection'),
    group: getString('order.cancellationReasons.inspectionIssue'),
  },
  {
    id: 'inspection_issue_coordination_issue',
    value: CancellationReasons.INSPECTION_ISSUE_COORDINATION_ISSUE,
    title: getString('order.cancellationReasons.coordinationIssue'),
    group: getString('order.cancellationReasons.inspectionIssue'),
  },
  {
    id: 'inspection_issue_inspection_issue_other',
    value: CancellationReasons.INSPECTION_ISSUE_OTHER,
    title: getString('order.cancellationReasons.inspectionIssueOther'),
    group: getString('order.cancellationReasons.inspectionIssue'),
  },
  {
    id: 'insurer_rejected_incorrect_car_usage',
    value: CancellationReasons.INSURER_REJECTED_INCORRECT_CAR_USAGE,
    title: getString('order.cancellationReasons.incorrectCarUsage'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_insurer_required_car_repair_first',
    value:
      CancellationReasons.INSURER_REJECTED_INSURER_REQUIRED_CAR_REPAIR_FIRST,
    title: getString(
      'order.cancellationReasons.insurerRejectedInsurerRequiredCarRepairFirst'
    ),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_not_pass_car_inspection',
    value: CancellationReasons.INSURER_REJECTED_NOT_PASS_CAR_INSPECTION,
    title: getString('order.cancellationReasons.notPassCarInspection'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_truck_accessories',
    value: CancellationReasons.INSURER_REJECTED_TRUCK_ACCESSORIES,
    title: getString('order.cancellationReasons.truckAccessories'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_speed_accessory_issue',
    value: CancellationReasons.INSURER_REJECTED_SPEED_ACCESSORY_ISSUE,
    title: getString('order.cancellationReasons.speedAccessoryIssue'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_mazda2_mou_issue',
    value: CancellationReasons.INSURER_REJECTED_MAZDA2_MOU_ISSUE,
    title: getString('order.cancellationReasons.mazda2MouIssue'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_exceed_car_year',
    value: CancellationReasons.INSURER_REJECTED_EXCEED_CAR_YEAR,
    title: getString('order.cancellationReasons.exceedCarYear'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_expired_package',
    value: CancellationReasons.INSURER_REJECTED_EXPIRED_PACKAGE,
    title: getString('order.cancellationReasons.expiredPackage'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_claim_record_issue',
    value: CancellationReasons.INSURER_REJECTED_CLAIM_RECORD_ISSUE,
    title: getString('order.cancellationReasons.claimRecordIssue'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_does_not_match_insurance_criteria',
    value:
      CancellationReasons.INSURER_REJECTED_DOES_NOT_MATCH_INSURANCE_CRITERIA,
    title: getString('order.cancellationReasons.insuranceCriteria'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_incorrect_package',
    value: CancellationReasons.INSURER_REJECTED_INCORRECT_PACKAGE,
    title: getString('order.cancellationReasons.incorrectPackage'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_coverage_date_change',
    value: CancellationReasons.INSURER_REJECTED_COVERAGE_DATE_CHANGE,
    title: getString('order.cancellationReasons.coverageDateChange'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'insurer_rejected_agent_offered',
    value: CancellationReasons.INSURER_REJECTED_AGENT_OFFERED,
    title: getString('order.cancellationReasons.insurerRejectedAgentOffered'),
    group: getString('order.cancellationReasons.insurerRejected'),
    newOption: true,
  },
  {
    id: 'insurer_rejected_other',
    value: CancellationReasons.INSURER_REJECTED_OTHER,
    title: getString('order.cancellationReasons.insurerOther'),
    group: getString('order.cancellationReasons.insurerRejected'),
  },
  {
    id: 'accounting_cancel_fail',
    value: CancellationReasons.ACCOUNTING_CANCEL_FAIL,
    title: getString('order.cancellationReasons.accountingCancelFail'),
    group: getString('order.cancellationReasons.accountingCancel'),
    newOption: true,
  },
];
