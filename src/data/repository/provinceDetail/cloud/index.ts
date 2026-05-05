import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import getConfig from 'data/setting';

const getProvince = (payload: any) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const provinceResource = RabbitResource.ProvinceDetail.getProvince(payload);
  return apiGateway.doGetAjaxRequest(provinceResource);
};

export default {
  getProvince,
};
