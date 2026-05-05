import { Observable } from 'rxjs';

import ResponseModel from 'models/response';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * An API Class for the insurer service.
 * {@link https://test.sabye-songkran.com/openapi/lead-import.html}
 */
export default class ImportApi extends BaseApi {
  readonly baseUrl = '/api/lead-import/v1alpha1/imports';

  getImportHistory(
    productName: string,
    importType: string,
    size: number,
    pageToken = '',
    orderBy = ''
  ): Observable<ResponseModel<any>> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${
        this.baseUrl
      }?filter=importType="${importType}" status!="WAITING_UPLOAD" product="${productName}"&pageSize=${size}${
        pageToken && `&pageToken=${pageToken}`
      }${orderBy}`,
    });
  }
}
