import { pluck } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import {
  GetCommentParams,
  CreateCommentParams,
} from 'shared/interfaces/common/order/comment';

import getConfig from '../../setting';

const apiGateway = ApiGateway.createAPIConnection(getConfig());

const createOrderComment = (body: CreateCommentParams) => {
  const createOrderDocumentResource =
    RabbitResource.OrderDetail.createOrderComment(body.orderId);
  const formData = Object.assign(body);
  delete formData.orderId;
  return apiGateway.doPostAjaxRequest(createOrderDocumentResource, formData);
};

const getComment = ({ name, params }: GetCommentParams) => {
  const getCommentResource = RabbitResource.OrderDetail.getComments(
    params,
    name
  );
  return apiGateway.doGetAjaxRequest(getCommentResource).pipe(pluck('data'));
};

export default {
  createOrderComment,
  getComment,
};
