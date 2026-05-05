import { combineReducers } from 'redux';

import createDocumentReducer from './create-document';
import listReducer from './import/listImport';
import leadAssignmentReducer from './lead-assignment';
import leadParticipantReducers from './lead-reject-participant';
import leadRecordingReducers from './lead-reject-recording';

const leadsReducer = combineReducers({
  leadAssignmentReducer,
  listReducer,
  leadParticipantReducers,
  leadRecordingReducers,
  createDocumentReducer,
});
export default leadsReducer;
