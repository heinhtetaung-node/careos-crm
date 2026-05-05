import { forkJoin, Observable, of } from 'rxjs';
import { catchError, pluck } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { IPayLoad } from 'data/gateway/api/helper/queryString.helper';
import { RabbitResource } from 'data/gateway/api/resource';
import ResponseModel from 'models/response';
import {
  ISummaryCall,
  IPostLeadRejection,
} from 'shared/interfaces/common/lead/detail';
import {
  ILeadSources,
  ICreateScore,
  ICreateLead,
} from 'shared/interfaces/common/lead/sources';

import getConfig from '../../../setting';

const FILTER_LEAD_OFFLINE = 'online=false';
const GET_ADMIN_QUERY = 'role="roles/admin"';
const apiGateway = ApiGateway.createAPIConnection(getConfig());

const prepareApiCall = (
  payload: {
    [key: string]: number | string | boolean;
  } & { orderBy?: string[] }
) => {
  const leadResource = RabbitResource.Lead.GetFullLeadSources(payload);
  return { apiGateway, leadResource };
};

const getLeadSources = (payload: any): Observable<ResponseModel<any>> => {
  const getLeadSourceResource = RabbitResource.Lead.GetLeadSources(payload);
  return apiGateway.doGetAjaxRequest(getLeadSourceResource).pipe(pluck('data'));
};

const getLeadSourcesService = (
  payload: any
): Observable<ResponseModel<any>> => {
  const getLeadSourceResource =
    RabbitResource.Lead.GetLeadSourcesService(payload);
  return apiGateway
    .doGetAjaxRequest(getLeadSourceResource)
    .pipe(pluck('data', 'sources'));
};

const getUtmMedium = (payload: any): Observable<ResponseModel<any>> => {
  const getLeadSourceResource = RabbitResource.Lead.GetUtmMedium(payload);
  return apiGateway.doGetAjaxRequest(getLeadSourceResource).pipe(pluck('data'));
};

const getUtmCampaign = (payload: any): Observable<ResponseModel<any>> => {
  const getLeadSourceResource = RabbitResource.Lead.GetUtmCampaign(payload);
  return apiGateway.doGetAjaxRequest(getLeadSourceResource).pipe(pluck('data'));
};

const getLeadSourcesWithScore = (
  payload: any
): Observable<ResponseModel<any>> => {
  const getLeadSourceResource = RabbitResource.Lead.GetLeadSources(payload);
  return apiGateway
    .doGetAjaxRequest(getLeadSourceResource)
    .pipe(pluck('data', 'sourcesWithScore'));
};

const getLeadSourcesCreateBy = (
  payload: any
): Observable<ResponseModel<any>> => {
  const filter: IPayLoad = {
    filter: `${payload.filter} ${GET_ADMIN_QUERY}`,
    orderBy: `${payload.orderBy}`,
    pageSize: `${payload.pageSize}`,
  };
  const getUsersResource = RabbitResource.User.getUsers(filter);
  return apiGateway
    .doGetAjaxRequest(getUsersResource)
    .pipe(pluck('data', 'usersWithTeam'));
};

const getOfflineLead = (): Observable<ResponseModel<any>> => {
  const { apiGateway: apiGatewayNew, leadResource } = prepareApiCall({
    filter: FILTER_LEAD_OFFLINE,
  });
  return apiGatewayNew.doGetAjaxRequest(leadResource).pipe(pluck('data'));
};

const getLeadSourceScore = (payload: string) => {
  const getLeadSourceScoreResource =
    RabbitResource.Lead.GetLeadSourcesScore(payload);

  return apiGateway
    .doGetAjaxRequest(getLeadSourceScoreResource)
    .pipe(pluck('data'));
};

const createLeadSources = (body: ILeadSources) => {
  const createLeadSourcesResource = RabbitResource.Lead.CreateLeadSources();

  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, body);
};

const createLeadSourcesScore = (body: ICreateScore) => {
  const createLeadSourcesResource =
    RabbitResource.Lead.CreateLeadSourcesScore();

  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, body);
};

const updateLeadSources = (body: ILeadSources) => {
  const sourceName = body.name || '';

  const createLeadSourcesResource =
    RabbitResource.Lead.UpdateLeadSources(sourceName);
  const _body: ILeadSources = {
    hidden: body.hidden,
    online: body.online,
    product: body.product,
    source: body.source,
  };

  return apiGateway.doPatchAjaxRequest(createLeadSourcesResource, _body);
};

// INFO: Lead Detail
const createRejection = (body: ISummaryCall) => {
  const parent = body.parent || '';

  const createRejectionResource = RabbitResource.Lead.CreateRejection(parent);
  const _body: ISummaryCall = {
    reason: body.reason,
    comment: body.comment,
    approved: body.approved,
  };

  return apiGateway.doPostAjaxRequest(createRejectionResource, _body);
};

const updateLeadSourceScore = (body: ICreateScore) => {
  const updateLeadSourcesScoreResource =
    RabbitResource.Lead.UpdateLeadSourcesScore(body.sourceName || '');

  const _body: ICreateScore = {
    name: body.name,
    score: body.score,
  };

  return apiGateway.doPatchAjaxRequest(updateLeadSourcesScoreResource, _body);
};

const createLead = (body: ICreateLead) => {
  const createLeadResource = RabbitResource.Lead.CreateLead();
  return apiGateway.doPostAjaxRequest(createLeadResource, body);
};

const getLeadAssignment = (body: ICreateLead, productName: string) => {
  const getLeadAssignmentResource = RabbitResource.Lead.getLeadAssignment(
    body,
    productName
  );
  return apiGateway.doGetAjaxRequest(getLeadAssignmentResource, body);
};

const getImportLeads = (payload: any): Observable<ResponseModel<any>> => {
  const getImportLeadResource = RabbitResource.Lead.GetImportLeadList(payload);
  return apiGateway.doGetAjaxRequest(getImportLeadResource).pipe(pluck('data'));
};

const getLeadRejectionById = (payload: any): Observable<ResponseModel<any>> => {
  const getImportLeadResource =
    RabbitResource.LeadDetail.GetLeadRejectionById(payload);
  return apiGateway.doGetAjaxRequest(getImportLeadResource).pipe(pluck('data'));
};

const postLeadRejection = (body: IPostLeadRejection) => {
  const createRejectionResource = RabbitResource.LeadDetail.PostLeadRejection(
    body.leadId
  );

  const formData = Object.assign(body);
  delete formData.leadId;

  return apiGateway.doPostAjaxRequest(createRejectionResource, formData);
};

const assignLeads = (body: { ids: string[]; assignedTo?: string }) => {
  const assignLeadsResource = RabbitResource.Lead.assignLeads();
  return apiGateway.doPostAjaxRequest(assignLeadsResource, body);
};

const assignLeadsWithLog = (
  ids: string[],
  assignedTo?: string
): Observable<ResponseModel<any>[]> => {
  const observables: Observable<ResponseModel<any>>[] = ids.map((id) => {
    const assignLeadWithLogResource = RabbitResource.Lead.assignLeadWithLog(id);
    const defaultPayload: any = {
      kind: 'LEAD',
    };

    if (assignedTo?.includes('team')) {
      defaultPayload.team = assignedTo;
    } else {
      defaultPayload.user = assignedTo;
    }

    return apiGateway
      .doPostAjaxRequest(assignLeadWithLogResource, defaultPayload)
      .pipe(catchError((err) => of(err)));
  });
  return forkJoin(observables);
};

const unassignLeadsWithLog = (
  ids: string[]
): Observable<ResponseModel<any>[]> => {
  const observables: Observable<ResponseModel<any>>[] = ids.map((id) => {
    const unassignLeadWithLogResource =
      RabbitResource.Lead.unassignLeadWithLog(id);
    return apiGateway
      .doDeleteAjaxRequest(unassignLeadWithLogResource)
      .pipe(catchError((err) => of(err)));
  });
  return forkJoin(observables);
};

const rejectLeads = (body: any) => {
  const rejectLeadsResource = RabbitResource.Lead.rejectLeads();
  return apiGateway.doPostAjaxRequest(rejectLeadsResource, body);
};

const transformPlaceholders = (body: any, lead: string) => {
  const transformPlaceholdersResource =
    RabbitResource.Lead.transformPlaceholders(lead);
  return apiGateway.doPostAjaxRequest(transformPlaceholdersResource, body);
};

const getRejectionComment = (payload: any) => {
  const getRejectionCommentResource =
    RabbitResource.Lead.GetSingleComment(payload);
  return apiGateway.doGetAjaxRequest(getRejectionCommentResource);
};

const getLeadParticipants = (payload: any) => {
  const getLeadParticipantsResource =
    RabbitResource.Lead.GetLeadParticipants(payload);
  return apiGateway.doGetAjaxRequest(getLeadParticipantsResource);
};

const getLeadRecording = (payload: any) => {
  const getLeadParticipantsResource =
    RabbitResource.Lead.GetLeadRecording(payload);
  return apiGateway.doGetAjaxRequest(getLeadParticipantsResource);
};

const createLeadDocument = ({ parents, params }: any) => {
  const createLeadDocumentResource =
    RabbitResource.Lead.CreateLeadDocument(parents);
  return apiGateway.doPostAjaxRequest(createLeadDocumentResource, params);
};

const deleteLeadDocument = (payload: any) => {
  const deleteLeadDocumentResource =
    RabbitResource.Lead.DeleteLeadDocument(payload);
  return apiGateway.doDeleteAjaxRequest(deleteLeadDocumentResource);
};

const getListLeadUploadedDocuments = (parent: string) => {
  const getLeadDocumentUploadedResource =
    RabbitResource.Lead.GetUploadedLeadDocuments(parent);
  return apiGateway.doGetAjaxRequest(getLeadDocumentUploadedResource);
};

export default {
  createLeadSources,
  updateLeadSources,
  createLeadSourcesScore,
  getLeadSources,
  getLeadSourcesService,
  createRejection,
  getLeadSourceScore,
  updateLeadSourceScore,
  getOfflineLead,
  getLeadSourcesWithScore,
  getLeadSourcesCreateBy,
  getUtmMedium,
  getUtmCampaign,
  createLead,
  getLeadAssignment,
  getImportLeads,
  postLeadRejection,
  assignLeads,
  assignLeadsWithLog,
  unassignLeadsWithLog,
  rejectLeads,
  transformPlaceholders,
  getRejectionComment,
  getLeadRejectionById,
  getLeadParticipants,
  getLeadRecording,
  createLeadDocument,
  deleteLeadDocument,
  getListLeadUploadedDocuments,
};
