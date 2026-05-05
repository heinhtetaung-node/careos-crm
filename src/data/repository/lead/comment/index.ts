import { pluck } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import getConfig from 'data/setting';
import {
  GetCommentParams,
  CreateCommentParams,
} from 'shared/interfaces/common/lead/comment';

const getComment = ({ name, params }: GetCommentParams) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getCommentSource = RabbitResource.Lead.GetComment(params, name);
  return apiGateway.doGetAjaxRequest(getCommentSource).pipe(pluck('data'));
};

const getLeads = (pageSize: number) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getLeadsSource = RabbitResource.Lead.GetLeads(pageSize);
  return apiGateway.doGetRequest(getLeadsSource).then((res: any) => res.data);
};

const createComment = ({ name, body }: CreateCommentParams) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const createCommentSource = RabbitResource.Lead.CreateComment(name);
  return apiGateway
    .doPostRequest(createCommentSource, JSON.stringify(body))
    .then((res: any) => res.data);
};

export default {
  getComment,
  getLeads,
  createComment,
};
