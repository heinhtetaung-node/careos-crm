import CreateCommentUseCase from './comment/CreateCommentUseCase';
import GetCommentUseCase from './comment/GetCommentUseCase';
import CreateDocumentLeadUseCase from './create-document';
import DeleteDocumentLeadUseCase from './delete-document';
import CreateRejectionUseCase from './detail/CreateRejectionUseCase';
import GetImportLeadsUseCase from './import/GetImportLeadUseCase';
import ImportLeadUseCase from './ImportLeadUseCase';
import GetLeadParticipantUseCase from './lead-reject-participant/GetLeadParticipantUseCase';
import GetLeadRecordingUseCase from './lead-reject-recording/GetLeadRecordingUseCase';
import GetListDocumentUploadedLeadUseCase from './list-document';
import CreateLeadSourcesScoreUseCase from './sources/CreateLeadSourcesScoreUseCase';
import CreateLeadSourcesUseCase from './sources/CreateLeadSourcesUseCase';
import GetLeadSourceScoreUseCase from './sources/GetLeadSourceScoreUseCase';
import GetLeadSourcesUseCase from './sources/GetLeadSourcesUseCase';
import UpdateLeadSourceScoreUseCase from './sources/UpdateLeadSourceScoreUseCase';
import UpdateLeadSourcesUseCase from './sources/UpdateLeadSourcesUseCase';

export default {
  GetCommentUseCase,
  CreateCommentUseCase,
  ImportLeadUseCase,
  CreateLeadSourcesUseCase,
  UpdateLeadSourcesUseCase,
  CreateLeadSourcesScoreUseCase,
  GetLeadSourcesUseCase,
  CreateRejectionUseCase,
  GetLeadSourceScoreUseCase,
  UpdateLeadSourceScoreUseCase,
  GetImportLeadsUseCase,
  GetLeadParticipantUseCase,
  GetLeadRecordingUseCase,
  CreateDocumentLeadUseCase,
  DeleteDocumentLeadUseCase,
  GetListDocumentUploadedLeadUseCase,
};
