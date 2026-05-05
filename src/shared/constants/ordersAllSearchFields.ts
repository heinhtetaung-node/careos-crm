import { getString } from 'presentation/theme/localization';
import {
  OrderDocumentStatus,
  ItemDocumentStatus,
  OrderQcStatus,
  ItemQcStatus,
  ItemSubmissionStatus,
  ItemApprovalStatus,
  AddOnTypes,
} from 'shared/constants/orderType';

export const documentStatusOptions = [
  {
    id: 1,
    value: OrderDocumentStatus.PENDING,
    title: getString('text.pending'),
  },
  {
    id: 2,
    value: OrderDocumentStatus.COMPLETE,
    title: getString('text.complete'),
    color: '#2FCE82',
  },
  {
    id: 3,
    value: OrderDocumentStatus.FAILED,
    title: getString('importFileStatus.error'),
  },
];

export const itemDocumentStatusOptions = [
  {
    id: 1,
    value: ItemDocumentStatus.PENDING,
    title: getString('text.pending'),
  },
  {
    id: 2,
    value: ItemDocumentStatus.COMPLETE,
    title: getString('text.complete'),
    color: '#2FCE82',
  },
  {
    id: 3,
    value: ItemDocumentStatus.FAILED,
    title: getString('importFileStatus.error'),
  },
];

export const qcStatusOptions = [
  {
    id: 1,
    value: OrderQcStatus.PENDING,
    title: getString('text.pending'),
  },
  {
    id: 2,
    value: OrderQcStatus.PREAPPROVED,
    title: getString('qcStatus.preApproved'),
  },
  {
    id: 3,
    value: OrderQcStatus.APPROVED,
    title: getString('qcStatus.approved'),
  },
  {
    id: 4,
    value: OrderQcStatus.REJECTED,
    title: getString('qcStatus.rejected'),
  },
];

export const itemQcStatusOptions = [
  {
    id: 1,
    value: ItemQcStatus.PENDING,
    title: getString('text.pending'),
  },
  {
    id: 2,
    value: ItemQcStatus.PREAPPROVED,
    title: getString('qcStatus.preApproved'),
  },
  {
    id: 3,
    value: ItemQcStatus.APPROVED,
    title: getString('qcStatus.approved'),
  },
  {
    id: 4,
    value: ItemQcStatus.REJECTED,
    title: getString('qcStatus.rejected'),
  },
];

export const submissionItemStatusOptions = [
  {
    id: 1,
    value: ItemSubmissionStatus.PENDING,
    title: getString('text.pending'),
  },
  {
    id: 2,
    value: ItemSubmissionStatus.PRESUBMITTED,
    title: getString('submissionStatus.preSubmitted'),
  },
  {
    id: 3,
    value: ItemSubmissionStatus.READY_TO_SUBMIT,
    title: getString('submissionStatus.readyToSubmit'),
  },
  {
    id: 4,
    value: ItemSubmissionStatus.SUBMITTED,
    title: getString('submissionStatus.submitted'),
  },
  {
    id: 5,
    value: ItemSubmissionStatus.MISSED_DEADLINE,
    title: getString('submissionStatus.missedDeadline'),
  },
];

export const approvalStatusOptions = [
  {
    id: 1,
    value: ItemApprovalStatus.PENDING,
    title: getString('text.pending'),
  },
  {
    id: 2,
    value: ItemApprovalStatus.APPROVED,
    title: getString('approvalStatusOptions.approved'),
  },
  {
    id: 3,
    value: ItemApprovalStatus.REJECTED,
    title: getString('approvalStatusOptions.rejected'),
  },
  {
    id: 4,
    value: ItemApprovalStatus.POLICY_UPLOADED,
    title: getString('approvalStatusOptions.policyUploaded'),
  },
  {
    id: 5,
    value: ItemApprovalStatus.SUBMISSION_PROBLEM,
    title: getString('approvalStatusOptions.submissionProblem'),
  },
];

export const approvalStatusSubmissionOptions = [
  {
    id: 1,
    value: 'Unassigned',
    title: getString('text.unassigned'),
    prefixColor: '#A5AAC0',
  },
  {
    id: 2,
    value: 'Pending',
    title: getString('text.pending'),
    prefixColor: '#F78F1E',
  },
  {
    id: 3,
    value: 'Approved',
    title: getString('text.approved'),
    prefixColor: '#2FCE82',
  },
  {
    id: 4,
    value: 'Rejected',
    title: getString('text.rejected'),
    prefixColor: '#EA4548',
  },
  {
    id: 5,
    value: 'Endorsement',
    title: getString('approveStatus.endorsement'),
    prefixColor: '#F78F1E',
  },
  {
    id: 6,
    value: 'Other Problems',
    title: getString('text.submissionProblem'),
    prefixColor: '#F78F1E',
  },
];

export const paymentStatusOptions = [
  { id: 1, title: getString('tableListing.fullyPaid'), value: true },
  { id: 2, title: getString('tableListing.notFullyPaid'), value: false },
];

export const addOnOptions = [
  {
    id: 1,
    title: getString('order.addOns.roadSideAssistance'),
    value: AddOnTypes.ROADSIDE_ASSISTANCE,
  },
  {
    id: 2,
    title: getString('order.addOns.carAssetCoverage'),
    value: AddOnTypes.ASSET,
  },
  {
    id: 3,
    title: getString('order.addOns.carReplacement'),
    value: AddOnTypes.CAR_REPLACEMENT,
  },
];
