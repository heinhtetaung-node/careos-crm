import { format } from 'date-fns';
import _get from 'lodash/get';
import { formatMotoType } from 'presentation/components/OrderListingTable/helper';
import { getString } from 'presentation/theme/localization';
import { leadTypeText } from 'shared/helper/utilities';
import { formatSatangToBaht } from 'utils/currency';
import { insurerEmails, type EmailConfig } from './insurerEmails';

export enum ExtractType {
  APPLICATION_NUMBER = 'เลขรับแจ้ง',
  REMARK_TO_SUBMISSION = 'Remark to submission',
}

export const commentExtractByText = async (
  text: string,
  getOrderComments: any,
  orderId: string
) => {
  const { comments } = await getOrderComments({
    orderId,
    filter: `text:"${text}"`,
    orderBy: 'createTime desc',
  }).unwrap();

  const latestComment = comments?.[0];
  if (!latestComment || !latestComment?.text) return '';
  const applicationNumber = text === ExtractType.APPLICATION_NUMBER;
  // There are cases to define for extracting data of Application number or Remark to submission
  const patternByType = applicationNumber ? text : `${text}.*?\n`;
  // Take everything from the demiter to last including line break
  const regexPattern = new RegExp(`${patternByType}(.*)`, 's');
  const extractValue = latestComment.text.match(regexPattern)?.[1];

  if (!extractValue || extractValue === '') return '';

  const flagToSplit = applicationNumber ? '//' : '\n\n';
  const [cleanValue] = extractValue.split(flagToSplit);

  return cleanValue?.trim() ?? '';
};

export const getInsurerEmailConfig = (
  insurerId: string,
  oicCode: string,
  leadType: string
): EmailConfig => {
  const insurerConfig = insurerEmails[insurerId];
  if (!insurerConfig) {
    return {
      to: '',
      cc: ['Followup@rabbit.co.th'],
    };
  }

  let emailType: keyof typeof insurerConfig = 'default';
  if (leadType === 'LEAD_TYPE_RENEWAL' && insurerId === 'insurers/33') {
    // LMG renewal submission
    emailType = 'renewal';
  }
  if (oicCode === 'TYPE_320' && insurerId === 'insurers/7') {
    // BKI truck submission
    emailType = 'truck';
  }

  const emailConfig = insurerConfig[emailType] || insurerConfig.default;
  if (!emailConfig) {
    return {
      to: '',
      cc: ['Followup@rabbit.co.th'],
    };
  }

  return {
    to: emailConfig.to,
    cc: emailConfig.cc || ['Followup@rabbit.co.th'],
  };
};

export const generateInsurerEmailContent = async (
  orderPolicy: Record<string, any>,
  orderData: any,
  orderId: string,
  getLeadById: any,
  getOrderComments: any
) => {
  const leadName = orderPolicy?.order?.lead
    ? orderPolicy?.order?.lead.split('/').at(-1)
    : '';
  const leadDetail =
    leadName?.length > 0 ? await getLeadById(leadName).unwrap() : undefined;

  const leadType = leadTypeText(leadDetail?.type ?? '');

  const emailConfig = getInsurerEmailConfig(
    orderPolicy?.policy?.insurer,
    orderPolicy?.order?.data?.oicCode,
    leadDetail?.type ?? ''
  );

  const carLicensePlate = _get(orderPolicy, 'order.data.carLicensePlate', '');
  let policyHolderTitle = orderPolicy?.order?.data?.policyHolder?.title;
  policyHolderTitle = policyHolderTitle
    ? getString(`text.${policyHolderTitle?.toLowerCase()}`)
    : '';
  const policyHolderName = _get(orderPolicy, 'policyHolderName', '');
  let policyStartDate = orderPolicy?.policy?.policyStartDate;
  policyStartDate = policyStartDate
    ? format(new Date(policyStartDate), 'dd/MM/yyyy')
    : '';
  let motorItemType = orderPolicy?.policy?.motorItemType;
  motorItemType = motorItemType ? formatMotoType(motorItemType) : '';
  const findMandatory = orderData?.items.some(
    (policy: any) => policy?.package?.insuranceCategory === 'MANDATORY'
  );
  const driversExists =
    _get(orderData, 'order.data.firstDriverDOB') ||
    _get(orderData, 'order.data.secondDriverDOB');

  const [applicationNumber, remarkToSubmission] = await Promise.all([
    commentExtractByText(
      ExtractType.APPLICATION_NUMBER,
      getOrderComments,
      orderId
    ),
    commentExtractByText(
      ExtractType.REMARK_TO_SUBMISSION,
      getOrderComments,
      orderId
    ),
  ]);

  const mandatoryInclude = findMandatory
    ? getString('copyPolicy.includeMandatory')
    : getString('copyPolicy.excludeMandatory');
  const specificDriver = driversExists
    ? getString('copyPolicy.specifyDriver')
    : getString('copyPolicy.notSpecifyDriver');

  let carRepairType = orderPolicy?.motorPackage?.carRepairType;
  carRepairType = carRepairType
    ? getString(`package.${carRepairType.toLowerCase()}`)
    : '';
  let sumInsured = orderPolicy?.policy?.sumInsured;
  sumInsured = sumInsured ? formatSatangToBaht(sumInsured) : 0;
  let customerPhone = orderPolicy?.customerInfo?.phones?.at(-1) ?? undefined;
  customerPhone = customerPhone?.phone?.replace('+66', '0') ?? '';

  const emailSubject = `${getString(
    'copyPolicy.registerInfo'
  )}: ${carLicensePlate} ${policyHolderTitle} ${policyHolderName}. ${getString(
    'dateTypeLeadOption.policyStartDate'
  )} ${policyStartDate}. ${getString('copyPolicy.trademark')}`;

  const information = [
    `${getString('copyPolicy.toWhomItMayConcern')}`,
    emailSubject,
    `${motorItemType} ${mandatoryInclude}, ${specificDriver}`,
    `${getString('qc.repairType')}: ${carRepairType}`,
    `${getString('leadDetailFields.sumInsured')} ${sumInsured} ${getString(
      'text.baht'
    )}`,
    `${getString('copyPolicy.customerContact')}: ${customerPhone}`,
    `${getString('leadDetailFields.leadType')}: ${leadType}`,
  ];

  if (applicationNumber !== '') {
    information.push(
      `${getString('copyPolicy.applicationNumber')}: ${applicationNumber}`
    );
  }
  if (remarkToSubmission !== '') {
    information.push(
      `${getString('copyPolicy.remarkToSubmission')}: ${remarkToSubmission}`
    );
  }

  return {
    emailAddress: emailConfig.to,
    emailCcs: emailConfig.cc,
    emailSubject,
    emailBody: information.join('\n'),
  };
};

export default commentExtractByText;
