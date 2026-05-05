import { ajax } from 'rxjs/ajax';

import { RabbitResource } from '../../gateway/api/resource';

const getSettingsRequest = (flow: string) => {
  const url = RabbitResource.Auth.getSettingsMethodUrl(flow);
  return ajax({
    url,
    method: 'GET',
    withCredentials: true,
  });
};

const getRecoveryLink = (user: string) => {
  const url = RabbitResource.Auth.getRecoveryLinkUrl(user);
  return ajax({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
};

export default { getSettingsRequest, getRecoveryLink };
