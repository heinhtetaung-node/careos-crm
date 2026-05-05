import { combineReducers } from 'redux';

import addAddressReducer from './addAddress';
import addLeadReducer from './addLead';
import attachmentReducer from './attachment';
import callReducer from './call';
import getCarBrandReducer from './car';
import commentReducer from './comment';
import emailReducer from './email';
import handleSummaryModalReducer from './handleSummaryModal';
import InstallmentReducer from './installment';
import getListInsurerReducer from './insurer';
import lead from './lead';
import remarkReducer from './remark';
import scheduleReducer from './scheduleModal';
import listAppointment from './scheduleModal/getAppointment';
import smsReducer from './sms';
import updateLeadImportantReducer from './updateLeadImportant';

const leadsDetailReducer = combineReducers({
  addAddressReducer,
  addLeadReducer,
  attachmentReducer,
  callReducer,
  commentReducer,
  emailReducer,
  getCarBrandReducer,
  getListInsurerReducer,
  lead,
  listAppointment,
  scheduleReducer,
  smsReducer,
  updateLeadImportantReducer,
  handleSummaryModalReducer,
  InstallmentReducer,
  remarkReducer,
});
export default leadsDetailReducer;
