import { throwError } from 'rxjs';
import { ajax } from 'rxjs/ajax';

import getConfig from '../../setting';

import ApiGateway from './index';

const apiGateway = ApiGateway.createAPIConnection(getConfig());

const xmlEntityTooLargeError = `
<?xml version='1.0' encoding='UTF-8'?>
<Error>
<Code>EntityTooLarge</Code>
<Message>Error message</Message>
</Error>
`;

const xmlOtherError = `
<?xml version='1.0' encoding='UTF-8'?>
<Error>
<Code>Unknown</Code>
<Message>Error message</Message>
</Error>
`;

jest.mock('rxjs/ajax', () => ({
  ajax: jest.fn(),
}));

const mockedAjax = jest.mocked(ajax);

describe('uploadFile', () => {
  it('can catch xml EntityTooLarge error from google storage', async () => {
    const mockFile = {
      type: 'image/png',
    };

    mockedAjax.mockReturnValue(
      throwError({ response: { text: () => xmlEntityTooLargeError } })
    );

    try {
      await apiGateway.uploadFile('/filepath', mockFile as File);
    } catch (error: any) {
      expect(error.message).toBe('errorMessage.exceedFilesizeLimit');
    }
  });

  it('can catch other xml errors from google storage', async () => {
    const mockFile = {
      type: 'image/png',
    };

    mockedAjax.mockReturnValue(
      throwError({ response: { text: () => xmlOtherError } })
    );

    try {
      await apiGateway.uploadFile('/filepath', mockFile as File);
    } catch (error: any) {
      expect(error.message).toBe('Error message');
    }
  });
});
