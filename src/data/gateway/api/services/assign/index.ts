import { Observable } from 'rxjs';

import ResponseModel from 'models/response';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * An API Class for the assignment service.
 * {@link https://test.sabye-songkran.com/openapi/assign.html}
 */
export default class AssignApi extends BaseApi {
  readonly baseUrl = '/api/assign/v1alpha1/leads';

  getAssignment(leadId: string): Observable<ResponseModel<any>> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/${leadId}/assignments`,
    });
  }
}
