import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';

import { IPresence } from '../../../../shared/interfaces/common/admin/user';
import getConfig from '../../../setting';

const updatePresence = (payload?: IPresence, userName?: string) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const createUserResource = RabbitResource.Presence.UpdatePresence(userName);

  return apiGateway.doPatchAjaxRequest(createUserResource, payload);
};

export default {
  updatePresence,
};
