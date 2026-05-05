import { ajax } from 'rxjs/ajax';
import { pluck } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { IPayLoad } from 'data/gateway/api/helper/queryString.helper';
import { RabbitResource } from 'data/gateway/api/resource';
import { LIST_INSURERS_PAGE_SIZE } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomQuote/customQuote.helper';
import {
  ILeadDetail,
  ISaveAppointment,
  IUpdateLead,
  ILicensePlate,
  IUpdateLeadStatus,
  ICreateComment,
  IDeleteAppointment,
} from 'shared/interfaces/common/lead/detail';

import { ICreatePackage } from '../../../../shared/interfaces/common/lead/package';
import getConfig from '../../../setting';

const apiGateway = ApiGateway.createAPIConnection(getConfig());

const pushComment = (body: ILeadDetail) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.PushComment(
    body.leadId
  );
  const formData = Object.assign(body);
  delete formData.leadId;
  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, formData);
};

const sendEmail = (body: ILeadDetail) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.SendEmail(
    body.leadId
  );
  const { leadId: _, ...formData } = body;
  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, formData);
};

const addPhone = (body: ILeadDetail) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.AddPhone(
    body.leadId
  );
  const formData = Object.assign(body);
  delete formData.leadId;
  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, formData);
};

const deleteCoupon = (body: ILeadDetail) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.AddCoupon(
    body.leadId
  );
  const formData = Object.assign(body);
  delete formData.leadId;
  return apiGateway.doDeleteAjaxRequest(createLeadSourcesResource, formData);
};

const sendSms = (body: ILeadDetail) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.SendSms(
    body.leadId
  );
  const formData = Object.assign(body);
  delete formData.leadId;
  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, formData);
};

const saveAppointment = (body: ISaveAppointment) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.SaveAppointment(
    body.userId
  );
  const formData = JSON.parse(JSON.stringify(body));
  delete formData.userId;
  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, formData);
};

const deleteAppointment = (body: IDeleteAppointment) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.DeleteAppointment(
    body.userId,
    body.appointmentId
  );
  return apiGateway.doDeleteAjaxRequest(createLeadSourcesResource, body);
};

const getAppointment = (body: { startDate: string; filter: string }) => {
  const getUsersResource = RabbitResource.LeadDetail.GetAppointment(body);
  return apiGateway.doGetAjaxRequest(getUsersResource).pipe(pluck('data'));
};

const getAttachment = (body: string) => {
  const getUsersResource = RabbitResource.LeadDetail.getAttachment(body);
  return apiGateway.doGetAjaxRequest(getUsersResource).pipe(pluck('data'));
};

const createAttachment = (body: ILeadDetail) => {
  const getUsersResource = RabbitResource.LeadDetail.createAttachment(
    body.leadId,
    body.mailId
  );
  const formData = Object.assign(body);
  delete formData.leadId;
  return apiGateway
    .doPostAjaxRequest(getUsersResource, formData.fileModal)
    .pipe(pluck('data'));
};

const createCustomQuote = (lead: string, customPackage: ICreatePackage) => {
  const getUsersResource = RabbitResource.LeadDetail.createCustomQuote(lead);
  return apiGateway.doPostAjaxRequest(getUsersResource, customPackage);
};

const uploadAttachment = (body: any) => {
  const getUsersResource = RabbitResource.LeadDetail.uploadAttachment(body.res);
  const { file } = body;
  const fileSizeLimit = 10;
  return apiGateway.uploadFile(getUsersResource.Path, file, fileSizeLimit);
};

const getListEmail = (body: ILeadDetail) => {
  const getUsersResource = RabbitResource.LeadDetail.getListEmail(body.leadId);
  return apiGateway.doGetAjaxRequest(getUsersResource).pipe(pluck('data'));
};

const addEmail = (body: ILeadDetail) => {
  const createLeadSourcesResource = RabbitResource.LeadDetail.AddEmail(
    body.leadId
  );
  const formData = Object.assign(body);
  delete formData.leadId;
  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, formData);
};

const addAddressToLeads = (payload: IPayLoad) => {
  const addAddressResource = RabbitResource.LeadDetail.AddAddressToLeads(
    payload.id as string
  );

  return apiGateway.doPostAjaxRequest(addAddressResource, payload);
};

const getCommunications = (payload: IPayLoad) => {
  const getCommunicationsResource = RabbitResource.LeadDetail.GetCommunications(
    payload.id as string
  );

  return apiGateway.doGetAjaxRequest(getCommunicationsResource);
};

const getAgent = (body: string) => {
  const getAgentResource = RabbitResource.LeadDetail.GetAgent(body);
  return apiGateway.doGetAjaxRequest(getAgentResource).pipe(pluck('data'));
};

const updateLeadData = (body: IUpdateLead) => {
  const updateLeads = RabbitResource.LeadDetail.UpdateLeadData(body.leadId);

  const bodyField: any = {};
  Object.keys(body).forEach((field) => {
    if (field !== 'updatingField' && field !== 'leadId') {
      bodyField[field] = body[field];
    }
  });

  return apiGateway.doPatchAjaxRequest(updateLeads, bodyField);
};

const getProvince = () => {
  const provinceResource = RabbitResource.LeadDetail.GetProvince();
  return apiGateway
    .doGetAjaxRequest(provinceResource)
    .pipe(pluck('data', 'provinces'));
};

const getProvinceById = (payload: string) => {
  const provinceResource = RabbitResource.LeadDetail.GetProvinceById(payload);
  return apiGateway.doGetAjaxRequest(provinceResource).pipe(pluck('data'));
};

const getDistrict = (payload: string) => {
  const provinceResource = RabbitResource.LeadDetail.GetDistrict(payload);
  return apiGateway
    .doGetAjaxRequest(provinceResource)
    .pipe(pluck('data', 'districts'));
};

const getDistrictById = (payload: IPayLoad) => {
  const provinceResource = RabbitResource.LeadDetail.GetDistrictById(payload);
  return apiGateway.doGetAjaxRequest(provinceResource).pipe(pluck('data'));
};

const getSubDistrict = (payload: string) => {
  const provinceResource = RabbitResource.LeadDetail.GetSubDistrict(payload);
  return apiGateway
    .doGetAjaxRequest(provinceResource)
    .pipe(pluck('data', 'subdistricts'));
};

const getSubDistrictById = (payload: IPayLoad) => {
  const provinceResource =
    RabbitResource.LeadDetail.GetSubDistrictById(payload);
  return apiGateway.doGetAjaxRequest(provinceResource).pipe(pluck('data'));
};

const getListInsurer = (payload: string) => {
  const newListInsurer = RabbitResource.LeadDetail.GetListInsurer(payload);
  return apiGateway.doGetAjaxRequest(newListInsurer).pipe(pluck('data'));
};

const getListInsurerFilter = () => {
  const newListInsurer = RabbitResource.LeadDetail.GetListInsurer(
    LIST_INSURERS_PAGE_SIZE
  );
  return apiGateway
    .doGetAjaxRequest(newListInsurer)
    .pipe(pluck('data', 'insurers'));
};

const getCarBySubModelYear = (body: string) => {
  const getCarBySubModelResource =
    RabbitResource.LeadDetail.getCarBySubModel(body);
  return apiGateway
    .doGetAjaxRequest(getCarBySubModelResource)
    .pipe(pluck('data'));
};

const getCarSubModel = (body: string) => {
  const getCarSubModelResource = RabbitResource.LeadDetail.getCarSubModel(body);
  return apiGateway
    .doGetAjaxRequest(getCarSubModelResource)
    .pipe(pluck('data'));
};

const getCarModel = (body: string) => {
  const getCarModelResource = RabbitResource.LeadDetail.getCarModel(body);
  return apiGateway.doGetAjaxRequest(getCarModelResource).pipe(pluck('data'));
};

const getCarBrand = (body: string) => {
  const getCarBrandResource = RabbitResource.LeadDetail.getCarBrand(body);
  return apiGateway.doGetAjaxRequest(getCarBrandResource).pipe(pluck('data'));
};

const updateLicensePlate = (body: ILicensePlate) => {
  const updateLicensePlateResource = RabbitResource.LeadDetail.UpdateLead(
    body.leadId
  );
  const formData = JSON.parse(JSON.stringify(body));
  delete formData.leadId;
  return apiGateway
    .doPatchAjaxRequest(updateLicensePlateResource, formData.body)
    .pipe(pluck('data'));
};

const updateLeadStatus = (body: IUpdateLeadStatus) => {
  const updateLeadStatusResource = RabbitResource.LeadDetail.UpdateLeadStatus(
    body.leadId
  );

  const formData = JSON.parse(JSON.stringify(body));
  delete formData.leadId;

  return apiGateway.doPatchAjaxRequest(updateLeadStatusResource, formData);
};

const postComment = ({ leadId, ...payload }: ICreateComment) => {
  const createLeadSourcesResource =
    RabbitResource.LeadDetail.PushComment(leadId);
  return apiGateway.doPostAjaxRequest(createLeadSourcesResource, payload);
};

const getMyLead = (productType: string, pageState?: any, delayTime = 0) => {
  const getMyLeadResource = RabbitResource.LeadDetail.GetMyLeads(
    productType,
    pageState
  );
  return apiGateway.doGetAjaxRequest(getMyLeadResource, delayTime);
};

const leadBulkImportant = (body: any) => {
  const bulkImportantResource = RabbitResource.LeadDetail.LeadBulkImportant();
  return apiGateway.doPostAjaxRequest(bulkImportantResource, body);
};

const getLeadDetailById = (body: any) => {
  const leadDetail = RabbitResource.LeadDetail.GetLeadDetailById(body);
  return apiGateway.doGetAjaxRequest(leadDetail).pipe(pluck('data'));
};

const getLeadPackage = (leadId: string) => {
  const getLeadPackageResource =
    RabbitResource.LeadDetail.GetLeadPackage(leadId);
  return apiGateway.doGetAjaxRequest(getLeadPackageResource);
};

const createPaySlip = (leadId: string, body: any) => {
  const createPaySlipResource = RabbitResource.LeadDetail.CreatePaySlip(leadId);
  const { Path } = createPaySlipResource;
  return ajax({
    url: Path,
    body,
    method: 'POST',
    withCredentials: true,
  }).pipe(pluck('response'));
};

const updateLead = (leadId: string, body: any) => {
  const updateLeadResource = RabbitResource.LeadDetail.UpdateLead(leadId);
  return apiGateway.doPatchAjaxRequest(updateLeadResource, body);
};

export default {
  pushComment,
  postComment,
  getListEmail,
  sendEmail,
  addPhone,
  sendSms,
  saveAppointment,
  deleteAppointment,
  getAppointment,
  getAttachment,
  createAttachment,
  uploadAttachment,
  addEmail,
  addAddressToLeads,
  getCommunications,
  getAgent,
  updateLeadData,
  getProvince,
  getDistrict,
  getSubDistrict,
  getSubDistrictById,
  getCarBySubModelYear,
  getListInsurer,
  getCarSubModel,
  getCarModel,
  getCarBrand,
  getProvinceById,
  updateLicensePlate,
  updateLeadStatus,
  getListInsurerFilter,
  getDistrictById,
  createCustomQuote,
  getMyLead,
  leadBulkImportant,
  deleteCoupon,
  getLeadDetailById,
  getLeadPackage,
  createPaySlip,
  updateLead,
};
