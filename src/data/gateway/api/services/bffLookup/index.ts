import { Observable } from 'rxjs';

import Type from '../../type';
import BaseApi from '../baseApi';

export default class BffLookupApi extends BaseApi {
  readonly baseUrl = '/api/users/lookup';

  getAllUsers(): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Nest,
      Path: `${this.baseUrl}`,
    });
  }
}
