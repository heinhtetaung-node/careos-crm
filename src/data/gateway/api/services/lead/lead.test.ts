import ApiGateway, {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoGetAjaxRequest,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoPostAjaxRequest,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoPatchAjaxRequest,
} from 'data/gateway/api/index';

import Type from '../../type';

import LeadApi from '.';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
  mockDoPostAjaxRequest.mockClear();
  mockDoPatchAjaxRequest.mockClear();
});

it('can update lead', () => {
  const leadApi = new LeadApi();

  leadApi.updateLead('leads/mock', { mock: '' });

  expect(mockDoPatchAjaxRequest).toHaveBeenCalled();
});

it('can add coupon', () => {
  const leadApi = new LeadApi();

  leadApi.addCoupon({ leadId: 'leads/mock', voucher: '' });

  expect(mockDoPostAjaxRequest).toHaveBeenCalled();
});

it('can get quotation history', () => {
  const leadApi = new LeadApi();
  const leadId = 'fakeLeadId';

  leadApi.getQuotationHistory(leadId);

  expect(mockDoGetAjaxRequest).toHaveBeenCalled();
  expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
    Type: Type.Public,
    Path: `${leadApi.baseUrl}/${leadId}/quotations?page_size=20`,
  });
});
