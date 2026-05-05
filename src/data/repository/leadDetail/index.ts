import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import getConfig from 'data/setting';
import {
  ILeadDetail,
  ISaveAppointment,
  IUpdateLead,
  ILicensePlate,
  IUpdateLeadStatus,
  ICreateComment,
} from 'shared/interfaces/common/lead/detail';
import { ICreatePackage } from 'shared/interfaces/common/lead/package';

import LeadDetailCloud from './cloud';

export const apiGateway = ApiGateway.createAPIConnection(getConfig());

export default class LeadDetailRepository {
  /**
   *
   * @param user
   * @returns {Promise<ResponseModel<any>>}
   */
  pushComment = (payload: ILeadDetail) => LeadDetailCloud.pushComment(payload);

  getListEmail = (payload: ILeadDetail) =>
    LeadDetailCloud.getListEmail(payload);

  sendEmail = (payload: ILeadDetail) => LeadDetailCloud.sendEmail(payload);

  sendSms = (payload: ILeadDetail) => LeadDetailCloud.sendSms(payload);

  saveAppointment = (payload: ISaveAppointment) =>
    LeadDetailCloud.saveAppointment(payload);

  getAppointment = (payload: { startDate: string; filter: string }) =>
    LeadDetailCloud.getAppointment(payload);

  getAttachment = (payload: string) => LeadDetailCloud.getAttachment(payload);

  createAttachment = (payload: ILeadDetail) =>
    LeadDetailCloud.createAttachment(payload);

  uploadAttachment = (payload: ILeadDetail) =>
    LeadDetailCloud.uploadAttachment(payload);

  addEmail = (payload: ILeadDetail) => LeadDetailCloud.addEmail(payload);

  addAddressToLeads = (payload: any) =>
    LeadDetailCloud.addAddressToLeads(payload);

  addPhone = (payload: ILeadDetail) => LeadDetailCloud.addPhone(payload);

  deleteCoupon = (payload: ILeadDetail) =>
    LeadDetailCloud.deleteCoupon(payload);

  static addLead(payload: Omit<ILeadDetail, 'leadId'>) {
    const addLeadResource = RabbitResource.LeadDetail.AddLead();
    const formData = cloneDeep(payload);
    return apiGateway.doPostAjaxRequest(addLeadResource, formData);
  }

  getAgent = (payload: string) => LeadDetailCloud.getAgent(payload);

  updateLeadData = (payload: IUpdateLead) =>
    LeadDetailCloud.updateLeadData(payload);

  getListInsurer = (payload: string) => LeadDetailCloud.getListInsurer(payload);

  getCarBySubModel = (payload: string) =>
    LeadDetailCloud.getCarBySubModelYear(payload);

  updateLicensePlate = (payload: ILicensePlate) =>
    LeadDetailCloud.updateLicensePlate(payload);

  updateLeadStatus = (payload: IUpdateLeadStatus) =>
    LeadDetailCloud.updateLeadStatus(payload);

  postComment = (payload: ICreateComment) =>
    LeadDetailCloud.postComment(payload);

  createCustomQuote = (payload: { lead: string; package: ICreatePackage }) =>
    LeadDetailCloud.createCustomQuote(payload.lead, payload.package);

  getMyLeads = (productType: string, pageState?: any, delayTime = 0) =>
    LeadDetailCloud.getMyLead(productType, pageState, delayTime);

  leadBulkImportant = (body: { ids: string[]; important: boolean }) =>
    LeadDetailCloud.leadBulkImportant(body);

  getLeadPackage = (leadId: string) => LeadDetailCloud.getLeadPackage(leadId);

  createPaySlip = (leadId: string, body: any) =>
    LeadDetailCloud.createPaySlip(leadId, body);

  getPaymentOptions = (leadId: string) => {
    const getPaymentOptionsResource =
      RabbitResource.LeadDetail.getPaymentOptions(leadId);

    return apiGateway.doGetAjaxRequest(getPaymentOptionsResource);
  };

  updateLead = (leadId: string, body: any) =>
    LeadDetailCloud.updateLead(leadId, body) as Observable<any>;
}
