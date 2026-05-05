import { parse } from 'date-fns';
import _sum from 'lodash/sum';

import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import { formatAmount } from 'presentation/components/common/InfoPanel/Insurance/Insurance.helper';
import { questionGroups } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { satangToBaht } from 'utils/currency';

export function formatCoverage(amount: string | number, digit: number = 2) {
  const options = {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  };

  return formatAmount(+amount, options);
}

/**
 * Returns satang amount in baht and with proper formatting
 * Example: 100000 = 1,000.00
 *
 * @param amount An amount in satang
 * @returns A comma-formatted value in baht
 */
export function formatSatang(amount: number | string) {
  return formatCoverage(satangToBaht(amount));
}

export function calculateAndFormatDiscounts(discounts: { amount: number }[]) {
  const totalDiscount =
    _sum(discounts?.map((discount) => Number(discount.amount))) ?? 0;

  return formatSatang(totalDiscount);
}

export function stringToDate(dateString: string, format = 'yyyy-MM-dd') {
  return parse(dateString, format, new Date());
}

export function generateCorrectAddonsAnswer(
  answers: Record<string, boolean>[],
  callback?: (qId: string) => void
) {
  if (!answers || answers?.length <= 0) return false;
  let answerResult = true;
  Object.entries(answers).forEach((question) => {
    const [qId, answer]: [string, any] = question;
    if (!qId.includes('addons')) return;
    if (callback) {
      callback(qId);
    }
    if (!answer) {
      answerResult = false;
    }
  });
  return answerResult;
}

export const documentByQuestion = (
  questionGroupId: string | undefined,
  uploadedDocuments: IUploadedDocument[]
) => {
  if (!questionGroupId || uploadedDocuments?.length <= 0) return undefined;
  let documentType: string | undefined;
  switch (questionGroupId) {
    case questionGroups.policyholder.id:
      documentType = DocumentType.DOCUMENT_TYPE_ID_CARD;
      break;
    case questionGroups.vehicle.id:
      documentType = DocumentType.DOCUMENT_TYPE_VEHICLE_REGISTRATION;
      break;
    default:
  }
  if (!documentType) return undefined;
  const findDocument = uploadedDocuments.find(
    (doc) => doc?.type === documentType
  );
  return (
    findDocument && {
      ...findDocument,
      fileType: findDocument?.label?.split('.')?.pop(),
    }
  );
};

export const cleanEmptyKeys = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => key.trim() !== ''));
