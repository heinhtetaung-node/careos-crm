import ApiGateway, {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoGetAjaxRequest,
} from 'data/gateway/api/index';

import Type from '../../type';

import AssignApi from '.';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
});

it('calls assignment api', () => {
  const assignApi = new AssignApi();
  const leadId = 'fakeLeadId';

  assignApi.getAssignment(leadId);

  expect(mockDoGetAjaxRequest).toHaveBeenCalled();
  expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
    Type: Type.Public,
    Path: `${assignApi.baseUrl}/${leadId}/assignments`,
  });
});
