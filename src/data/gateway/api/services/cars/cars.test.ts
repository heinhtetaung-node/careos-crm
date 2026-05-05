// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ApiGateway, { mockDoGetAjaxRequest } from 'data/gateway/api/index';

import Type from '../../type';

import CarsApi from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
});

describe('cars API', () => {
  it('handle car model service call', () => {
    expect(ApiGateway).not.toHaveBeenCalled();
    const carsApi = new CarsApi();
    const modelYear = '2010';
    carsApi.getCarModel(modelYear);

    expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
      Type: Type.Nest,
      Path: `${carsApi.baseUrl}/${modelYear}`,
    });
  });
});
