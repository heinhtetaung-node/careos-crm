import { Observable } from 'rxjs';

import ResponseModel from 'models/response';
import { Insurer, InsurersResponse } from 'shared/types/insurers';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * An API Class for the insurer service.
 * {@link https://test.sabye-songkran.com/openapi/insurer.html}
 */
export default class InsurerApi extends BaseApi {
  readonly baseUrl = '/api/car/v1alpha1/insurers';

  getInsurers(
    size: number,
    pageToken = ''
  ): Observable<ResponseModel<InsurersResponse>> {
    if (size < 1) throw new Error('Invalid page size');
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}?pageSize=${size}&pageToken=${pageToken}`,
    });
  }

  getInsurer(insurerName: string): Observable<ResponseModel<Insurer>> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/${insurerName}`,
    });
  }
}
