import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import getConfig from 'data/setting';

const getCarDetail = (payload: any) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const carResource = RabbitResource.CarDetail.getCarDetail(payload);
  return apiGateway.doGetAjaxRequest(carResource);
};

export default {
  getCarDetail,
};
