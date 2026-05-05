import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';

import getConfig from '../../setting';

const apiGateway = ApiGateway.createAPIConnection(getConfig());

const execute = (payload: any) => {
  const createOrderDocumentResource = RabbitResource.OrderDetail.updateOrder(
    payload?.name
  );

  return apiGateway.doPatchAjaxRequest(createOrderDocumentResource, payload);
};

const assignOrder = (payload: any) => {
  const assignOrderToAgentResource =
    RabbitResource.OrderDetail.assignOrderToAgent(payload.assignType);

  return apiGateway.doPostAjaxRequest(assignOrderToAgentResource, payload.body);
};

export default {
  execute,
  assignOrder,
};
