import ApiGateway from 'data/gateway/api/index';
import getConfig from 'data/setting';

export default abstract class BaseApi {
  abstract readonly baseUrl: string;

  protected apiGateway: ApiGateway;

  constructor() {
    this.apiGateway = new ApiGateway(getConfig());
  }
}
