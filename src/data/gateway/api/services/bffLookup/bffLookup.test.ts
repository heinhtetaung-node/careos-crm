// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ApiGateway, { mockDoGetAjaxRequest } from 'data/gateway/api/index';

import Type from '../../type';

import BffLookupApi from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
});

describe('bffLookup API', () => {
  it('can get all users', () => {
    expect(ApiGateway).not.toHaveBeenCalled();
    const bffLookupApi = new BffLookupApi();

    bffLookupApi.getAllUsers();

    expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
      Type: Type.Nest,
      Path: `${bffLookupApi.baseUrl}`,
    });
  });
});
