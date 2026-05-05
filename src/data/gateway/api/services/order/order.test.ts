import ApiGateway, {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoGetAjaxRequest,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoPatchAjaxRequest,
} from 'data/gateway/api/index';
import { OrderDocumentStatus } from 'shared/constants/orderType';

import Type from '../../type';

import OrderApi from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
  mockDoPatchAjaxRequest.mockClear();
});

it('calls ApiGateway in class constructor', () => {
  const orderApi = new OrderApi();
  expect(ApiGateway).toHaveBeenCalled();

  // Ensure constructor created the object:
  expect(orderApi).toBeTruthy();
});

it('can get order listing data', () => {
  const orderApi = new OrderApi();

  orderApi.getListOrders();

  expect(mockDoGetAjaxRequest).toHaveBeenCalled();
});

it('can get order data', () => {
  expect(ApiGateway).not.toHaveBeenCalled();
  const orderApi = new OrderApi();
  const name = 'test';

  orderApi.getOrder(name);

  expect(mockDoGetAjaxRequest.mock.calls[0][0]).toEqual({
    Type: Type.Public,
    Path: `${orderApi.baseUrl}/${name}`,
  });
});

it('can update document status', () => {
  const orderApi = new OrderApi();

  orderApi.updateDocumentStatus('orders/test', {
    status: OrderDocumentStatus.COMPLETE,
  });

  expect(mockDoPatchAjaxRequest).toHaveBeenCalled();
});
