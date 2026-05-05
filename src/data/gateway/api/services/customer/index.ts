import { Observable } from 'rxjs';

import Type from '../../type';
import BaseApi from '../baseApi';

export const ArrayToQueryString = (key: string, data: string[]) => {
  let query = '';
  query =
    data.length > 1
      ? `${key} in ( ${data.map((d) => JSON.stringify(d))} )`
      : `${key}=${JSON.stringify(data[0])}`;

  return encodeURIComponent(query);
};

/**
 * Customer service
 * {@link https://test.sabye-songkran.com/openapi/customer.html#tag/CustomerService}
 */
export default class CustomerApi extends BaseApi {
  readonly baseUrl = '/api/customer/v1alpha1';

  getCustomers(): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/customers`,
    });
  }

  getCustomer(customerName: string): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/${customerName}`,
    });
  }

  updateCustomer(customerName: string, payload: any): Observable<any> {
    return this.apiGateway.doPatchAjaxRequest(
      {
        Type: Type.Public,
        Path: `${this.baseUrl}/${customerName}`,
      },
      payload
    );
  }
}
