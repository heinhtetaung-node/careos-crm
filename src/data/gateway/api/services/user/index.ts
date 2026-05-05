import { Observable } from 'rxjs';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * User service
 * {@link https://test.sabye-songkran.com/openapi/user.html}
 */
export default class UserApi extends BaseApi {
  readonly baseUrl = '/api/user/v1alpha1';

  getUser(name: string): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/${name}?showDeleted=true`,
    });
  }

  getUserWithTeam(id: string): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `/api/view/v1alpha1/views/users/${id}?showDeleted=true`,
    });
  }
}
