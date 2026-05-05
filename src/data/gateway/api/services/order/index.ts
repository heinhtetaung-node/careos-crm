import { Observable } from 'rxjs';

import { IFormData } from 'presentation/components/modal/OrderDetailModal/UpdateModal';
import { OrderDocumentStatus } from 'shared/constants/orderType';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * Order service
 * {@link https://test.sabye-songkran.com/openapi/order.html#tag/OrderService}
 */
export default class OrderApi extends BaseApi {
  readonly baseUrl = '/api/order/v1alpha1';

  getListOrders(): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/orders`,
    });
  }

  /**
   * @param orderName Name of the order to retrieve. Must be in the form of orders/{order}.
   */
  getOrder(orderName: string): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}/${orderName}`,
    });
  }

  updateDocumentStatus(
    orderName: string,
    payload: { status: OrderDocumentStatus }
  ): Observable<IFormData> {
    return this.apiGateway.doPatchAjaxRequest(
      {
        Type: Type.Public,
        Path: `${this.baseUrl}/${orderName}:updateDocumentStatus`,
      },
      payload
    );
  }
}
