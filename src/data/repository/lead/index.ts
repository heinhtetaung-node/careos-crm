import {
  GetCommentParams,
  CreateCommentParams,
} from 'shared/interfaces/common/lead/comment';
import {
  IPostLeadRejection,
  ISummaryCall,
} from 'shared/interfaces/common/lead/detail';
import {
  ILeadSources,
  ICreateScore,
  ICreateLead,
} from 'shared/interfaces/common/lead/sources';

import LeadCloud from './cloud';
import CommentCloud from './comment';

export default class LeadRepository {
  /**
   *
   * @returns {Promise<ResponseModel<any>>}
   */
  getComment = (payload: GetCommentParams) => CommentCloud.getComment(payload);

  createComment = (payload: CreateCommentParams) =>
    CommentCloud.createComment(payload);

  // INFO: Lead Sources
  getLeadSources = (payload: any) => {
    return LeadCloud.getLeadSources(payload);
  };

  getLeadSourceScore = (payload: string) => {
    return LeadCloud.getLeadSourceScore(payload);
  };

  createLeadSources = (payload: ILeadSources) => {
    return LeadCloud.createLeadSources(payload);
  };

  createLeadSourcesScore = (payload: ICreateScore) => {
    return LeadCloud.createLeadSourcesScore(payload);
  };

  updateLeadSources = (payload: ILeadSources) => {
    return LeadCloud.updateLeadSources(payload);
  };

  // INFO: Lead Detail
  createRejection = (payload: ISummaryCall) => {
    return LeadCloud.createRejection(payload);
  };

  updateLeadSourceScore = (payload: ICreateScore) => {
    return LeadCloud.updateLeadSourceScore(payload);
  };

  createLead = (payload: ICreateLead) => {
    return LeadCloud.createLead(payload);
  };

  getLeadAssignment = (payload: any, productName: string) => {
    return LeadCloud.getLeadAssignment(payload, productName);
  };

  getImportLeads = (payload: any) => {
    return LeadCloud.getImportLeads(payload);
  };

  postLeadRejection = (payload: IPostLeadRejection) => {
    return LeadCloud.postLeadRejection(payload);
  };

  assignLeads = (payload: any) => {
    return LeadCloud.assignLeads(payload);
  };

  static assignLeadsWithLog = (ids: string[], assignedTo: string) => {
    return LeadCloud.assignLeadsWithLog(ids, assignedTo);
  };

  static unassignLeadsWithLog = (ids: string[]) => {
    return LeadCloud.unassignLeadsWithLog(ids);
  };

  rejectLeads = (payload: any) => {
    return LeadCloud.rejectLeads(payload);
  };

  transformPlaceholders = (payload: any, lead: string) => {
    return LeadCloud.transformPlaceholders(payload, lead);
  };

  getSingleComment = (payload: any) => {
    return LeadCloud.getRejectionComment(payload);
  };

  getLeadParticipants = (payload: any) => {
    return LeadCloud.getLeadParticipants(payload);
  };

  getLeadRecording = (payload: any) => {
    return LeadCloud.getLeadRecording(payload);
  };

  createLeadDocument = (payload: any) => {
    return LeadCloud.createLeadDocument(payload);
  };

  deleteLeadDocument = (payload: any) => {
    return LeadCloud.deleteLeadDocument(payload);
  };

  getLeadUploadedDocuments = (payload: any) => {
    return LeadCloud.getListLeadUploadedDocuments(payload);
  };
}
