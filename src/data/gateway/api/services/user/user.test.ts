// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ApiGateway, { mockDoGetAjaxRequest } from 'data/gateway/api/index';

import Type from '../../type';

import UserApi from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
});

describe('User API', () => {
  it('can get user data', () => {
    expect(ApiGateway).not.toHaveBeenCalled();
    const userApi = new UserApi();
    const name = 'test';

    userApi.getUser(name);

    expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
      Type: Type.Public,
      Path: `${userApi.baseUrl}/${name}?showDeleted=true`,
    });
  });
});
