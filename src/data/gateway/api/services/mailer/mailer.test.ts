// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ApiGateway, { mockDoGetAjaxRequest } from 'data/gateway/api/index';

import Type from '../../type';

import MailerApi from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
});

describe('mailer API', () => {
  it('handle mailer api call', () => {
    expect(ApiGateway).not.toHaveBeenCalled();
    const mailerApi = new MailerApi();
    mailerApi.getUnreadMailCount('12312312');

    expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
      Type: Type.Public,
      Path: `${mailerApi.baseUrl}leads/12312312/mails:count?filter=unread`,
    });
  });
});
