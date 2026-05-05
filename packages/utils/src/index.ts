// eslint-disable-next-line import/prefer-default-export
export { insertInterval, isObjectEmpty } from './array';
export { moneyToNumber, numberToMoney } from './formatter/money';
export { removeZeroPadding } from './formatter/number';
export { commonFetch } from './apifetch/commonFetch';
export { jsonToBase64 } from './formatter/jsonToBase64';
export { dataURItoFile } from './formatter/dataURItoFile';
export { formatDateToOrdinal, formatDateInput } from './formatter/date';
export { uploadDocumentViaDocumentService } from './apifetch/uploadDocument';
export { downloadDocument } from './downloadDocument';
export {
  nameValidator as motorPolicyHolderNameValidator,
  validateMotorPolicyHolderName,
  rabbitString,
} from './validator/string';
export { mockUseFlags } from './mockUseFlag/index';
export { matchParamsAndLink } from './helpers/matchParamsAndLink';
export {
  getAgeByBirthday,
  getBornYearByAge,
  getBornDateRangeByAge,
} from './dateFunc';
export { formatPhoneNumber, isLandLine } from './formatter/phone';
export { formatThaiId } from './formatter/thaiId';
export { coverageDetails } from './transformer/health/coverageDetails';
