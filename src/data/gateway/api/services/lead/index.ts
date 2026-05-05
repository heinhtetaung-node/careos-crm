import { Observable } from 'rxjs';

import ResponseModel from 'models/response';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * An API Class for the lead service.
 * {@link https://test.sabye-songkran.com/openapi/lead.html}
 */
export default class LeadApi extends BaseApi {
  readonly baseUrl = '/api/lead/v1alpha2/leads';

  updateLead(leadId: string, payload: any): Observable<ResponseModel<any>> {
    return this.apiGateway.doPatchAjaxRequest(
      {
        Type: Type.Public,
        Path: `${this.baseUrl}/${leadId}`,
      },
      payload
    );
  }

  addCoupon(payload: { leadId: string; voucher: string }) {
    return this.apiGateway.doPostAjaxRequest(
      {
        Type: Type.Nest,
        Path: `/api/leads/${payload.leadId}/voucher`,
      },
      {
        voucher: payload.voucher,
      }
    );
  }

  getQuotationHistory(leadId: string) {
    // Hardcoding page_size to always be 20
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/${leadId}/quotations?page_size=20`,
    });
  }
}
