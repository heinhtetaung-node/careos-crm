import ApiGateway, {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoGetAjaxRequest,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoPatchAjaxRequest,
} from 'data/gateway/api/index';

import Type from '../../type';

import CustomerApi, { ArrayToQueryString } from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
  mockDoPatchAjaxRequest.mockClear();
});

describe('Customer API', () => {
  it('calls ApiGateway in class constructor', () => {
    const customerApi = new CustomerApi();
    expect(ApiGateway).toHaveBeenCalled();

    // Ensure constructor created the object:
    expect(customerApi).toBeTruthy();
  });

  it('can get customer listing data', () => {
    expect(ApiGateway).not.toHaveBeenCalled();
    const customerApi = new CustomerApi();

    customerApi.getCustomers();

    expect(mockDoGetAjaxRequest).toHaveBeenCalled();
  });

  it('can get customer data', () => {
    expect(ApiGateway).not.toHaveBeenCalled();
    const customerApi = new CustomerApi();
    const customerName = 'test';

    customerApi.getCustomer(customerName);

    expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
      Type: Type.Public,
      Path: `${customerApi.baseUrl}/${customerName}`,
    });
  });

  it('can update customer data', () => {
    const customerApi = new CustomerApi();
    const customerName = 'Sunee';
    const payload = { firstName: 'John' };

    customerApi.updateCustomer(customerName, payload);

    expect(mockDoPatchAjaxRequest.mock.calls[0]).toEqual([
      {
        Type: Type.Public,
        Path: `${customerApi.baseUrl}/${customerName}`,
      },
      payload,
    ]);
  });
  it('Test ArrayToQuery Functions', () => {
    expect(ArrayToQueryString('phone', ['+9998883838'])).toEqual(
      'phone%3D%22%2B9998883838%22'
    );
  });
});
