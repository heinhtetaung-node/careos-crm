import ApiGateway, {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoGetAjaxRequest,
} from 'data/gateway/api/index';

import ImportApi from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

beforeEach(() => {
  mockedApiGateway.mockClear();
  mockDoGetAjaxRequest.mockClear();
});

describe('Import API', () => {
  it('calls ApiGateway in class constructor', () => {
    const importApi = new ImportApi();

    expect(ApiGateway).toHaveBeenCalled();
    expect(importApi).toBeTruthy();
  });

  it('Calls API with passed parameters(products/car-insurance)', () => {
    const importApi = new ImportApi();

    importApi.getImportHistory('products/car-insurance', 'CAR_PRICE', 15);

    expect(mockDoGetAjaxRequest).toHaveBeenCalledWith({
      Path: '/api/lead-import/v1alpha1/imports?filter=importType="CAR_PRICE" status!="WAITING_UPLOAD" product="products/car-insurance"&pageSize=15',
      Type: 'public',
    });
  });

  it('Calls API with passed parameters(products/health-insurance)', () => {
    const importApi = new ImportApi();

    importApi.getImportHistory(
      'products/health-insurance',
      'CAR_PRICE',
      15,
      'fakeToken',
      ''
    );

    expect(mockDoGetAjaxRequest).toHaveBeenCalledWith({
      Path: '/api/lead-import/v1alpha1/imports?filter=importType="CAR_PRICE" status!="WAITING_UPLOAD" product="products/health-insurance"&pageSize=15&pageToken=fakeToken',
      Type: 'public',
    });
  });

  it('Calls API with passed parameters', () => {
    const importApi = new ImportApi();

    importApi.getImportHistory(
      'fakeProductName',
      'CAR_PRICE',
      15,
      'fakeToken',
      ''
    );

    expect(mockDoGetAjaxRequest).toHaveBeenCalledWith({
      Path: '/api/lead-import/v1alpha1/imports?filter=importType="CAR_PRICE" status!="WAITING_UPLOAD" product="fakeProductName"&pageSize=15&pageToken=fakeToken',
      Type: 'public',
    });
  });
});
