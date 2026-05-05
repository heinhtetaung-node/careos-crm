import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';

import getConfig from '../../setting';

const apiGateway = ApiGateway.createAPIConnection(getConfig());

const createOrderDocument = ({ orderName, params }: any) => {
  const removeLastSlash = orderName.replace(/\/$/, '');
  const createOrderDocumentResource =
    RabbitResource.OrderDetail.createOrderDocument(removeLastSlash);

  return apiGateway.doPostAjaxRequest(createOrderDocumentResource, params);
};

const deleteOrderDocument = (payload: any) => {
  const deleteOrderDocumentResource =
    RabbitResource.OrderDetail.deleteOrderDocument(payload);

  return apiGateway.doDeleteAjaxRequest(deleteOrderDocumentResource);
};

const getUploadedDocs = (orderName: string) => {
  const removeLastSlash = orderName.replace(/\/$/, '');
  const getUploadedDocumentsResource =
    RabbitResource.OrderDetail.getUploadedDocuments(removeLastSlash);

  return apiGateway.doGetAjaxRequest(getUploadedDocumentsResource);
};

export default {
  createOrderDocument,
  deleteOrderDocument,
  getUploadedDocs,
};
