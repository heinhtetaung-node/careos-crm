import {
  GetCommentParams,
  CreateCommentParams,
} from 'shared/interfaces/common/order/comment';

import Comment from './comment';
import Document from './document';
import GetOrders from './getOrders';
import updateOrder from './updateOrder';

export default class OrderDetailRepository {
  getComment = (payload: GetCommentParams) => {
    return Comment.getComment(payload);
  };

  /**
   * @param {CreateCommentParams}  body - A string param.
   */
  createOrderComment = (body: CreateCommentParams) => {
    return Comment.createOrderComment(body);
  };

  /**
   * @param {any}  body - A string param.
   */
  createOrderDocument = (body: any) => {
    return Document.createOrderDocument(body);
  };

  deleteDocument = (body: any) => {
    /**
     * @param {any}  body - A string param.
     */
    return Document.deleteOrderDocument(body);
  };

  updateOrder = (body: any) => {
    /**
     * @param {any}  body - A string param.
     */
    return updateOrder.execute(body);
  };

  assignOrder = (body: any) => {
    return updateOrder.assignOrder(body);
  };

  getUploadedDocuments = (orderName: string) => {
    return Document.getUploadedDocs(orderName);
  };

  getOrdersList = (payload: any, productName: string) => {
    return GetOrders.getOrdersList(payload, productName);
  };

  getOrdersSubmission = (payload: any, productName: string) => {
    return GetOrders.getOrdersSubmission(payload, productName);
  };
}
