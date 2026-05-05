import * as CONSTANTS from 'shared/constants';
import { IResource } from 'shared/interfaces/common/resource';

import Type from '../../type';

const apiUrl = '/api/order/v1alpha1';

interface GetCommentParams {
  pageSize: number;
  pageToken: string;
  showDeleted: boolean;
  filter: string;
  orderBy: string;
}

const createOrderComment = (orderName?: string): IResource => ({
  Type: Type.Public,
  Path: `${apiUrl}/orders/${orderName}/comments`,
});

const createOrderDocument = (orderName?: string): IResource => ({
  Type: Type.Public,
  Path: `${apiUrl}/${orderName}/documents`,
});

const deleteOrderDocument = (document: string): IResource => ({
  Type: Type.Public,
  Path: `${apiUrl}/${document}`,
});

const updateOrder = (orderName?: string): IResource => ({
  Type: Type.Public,
  Path: `${apiUrl}/${orderName}`,
});

const assignOrderToAgent = (assignType: string): IResource => ({
  Type: Type.Nest,
  Path: `/${CONSTANTS.apiEndpoint.orderEndpoint}/${assignType}/assign`,
});

const getUploadedDocuments = (orderName: string): IResource => ({
  Type: Type.Public,
  Path: `${apiUrl}/${orderName}/documents?pageSize=50`,
});

export const getComments = (
  {
    pageSize = 5,
    pageToken = '',
    showDeleted = false,
    filter = '',
    orderBy = '',
  }: GetCommentParams,
  name?: any
): IResource => ({
  Type: Type.Nest,
  Path: `/api/${name}comments?pageSize=${pageSize}&pageToken=${pageToken}&filter=${filter}&orderBy=${orderBy}&showDeleted=${showDeleted}`,
});

export default {
  createOrderComment,
  createOrderDocument,
  deleteOrderDocument,
  updateOrder,
  assignOrderToAgent,
  getUploadedDocuments,
  getComments,
};
