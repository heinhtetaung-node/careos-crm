import { Observable } from 'rxjs';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * Model service
 * {@link https://test.sabye-songkran.com/openapi/car.html#tag/ModelService}
 */
export default class CarsApi extends BaseApi {
  readonly baseUrl = '/api/cars/years';

  /**
   * @param modelYear Model year of car to retrieve.
   */
  getCarModel(modelYear: string): Observable<any> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Nest,
      Path: `${this.baseUrl}/${modelYear}`,
    });
  }
}
