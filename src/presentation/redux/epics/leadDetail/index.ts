import { combineEpics } from 'redux-observable';

import addLeadEpic from './addLeadEpic';
import addAddressToLeadsEpic from './addressEpic';
import leadDetailCommentEpic from './commentEpic';
import leadDetailCouponEpic from './couponEpic';
import {
  createCustomQuoteSuccessEpic,
  createCustomQuoteEpic,
} from './customQuoteEpic';
import leadDetailEmailEpic from './emailEpic';
import getCarBrandEpic from './getCarEpic';
import getPaymentOptionsEpic from './getInstallment';
import insurerEpic from './getInsurer';
import getAgentEpic from './getLeadDataEpic';
import leadRejectionEpic from './leadRejectionEpic';
import leadDetailPhoneEpic from './phoneEpic';
import remarkEpic from './remarkEpic';
import leadDetailScheduleEpic from './scheduleModal';
import leadDetailSmsEpic from './smsEpic';
import subscribeLeadUpdatesEpic from './subscribeLeadUpdatesEpic';
import summaryCallEpic from './summaryCallEpic';
import handleSummaryModalEpic from './SummaryModalEpic';
import updateCustomerDetailEpic from './updateCustomerDetailEpic';
import updateLeadImportantEpic from './updateLeadImportantEpic';
import updateLeadInformationEpic from './updateLeadInformationEpic';
import updateLeadStatusEpic from './updateLeadStatusEpic';

const leadDetailEpic = combineEpics(
  leadDetailCommentEpic,
  leadDetailScheduleEpic,
  summaryCallEpic,
  leadDetailEmailEpic,
  leadDetailSmsEpic,
  addAddressToLeadsEpic,
  leadDetailPhoneEpic,
  getAgentEpic,
  addLeadEpic,
  updateLeadInformationEpic,
  getCarBrandEpic,
  insurerEpic,
  updateCustomerDetailEpic,
  updateLeadStatusEpic,
  leadRejectionEpic,
  updateLeadImportantEpic,
  handleSummaryModalEpic,
  leadDetailCouponEpic,
  createCustomQuoteEpic,
  createCustomQuoteSuccessEpic,
  getPaymentOptionsEpic,
  remarkEpic,
  subscribeLeadUpdatesEpic
);

export default leadDetailEpic;
