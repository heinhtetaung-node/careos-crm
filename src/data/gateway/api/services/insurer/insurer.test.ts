import { of } from 'rxjs';

import ApiGateway, {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockDoGetAjaxRequest,
} from 'data/gateway/api/index';
import { Insurer } from 'shared/types/insurers';

import BaseApi from '../baseApi';

import InsurerAPI from './index';

jest.mock('data/gateway/api/index');

const mockedApiGateway = jest.mocked(ApiGateway);

const INSURER_NAME = 'Test Insurer';
const DISPLAY_NAME = 'Test';
const ORDER = 1;

const mockInsurer = {
  name: INSURER_NAME,
  displayName: DISPLAY_NAME,
  order: ORDER,
} as Insurer;

describe('Insurer API class', () => {
  let api: InsurerAPI;

  beforeEach(() => {
    mockedApiGateway.mockClear();
    mockDoGetAjaxRequest.mockClear();
    api = new InsurerAPI();
  });

  it('should be of type InsurerAPI', () => {
    expect(api).toBeInstanceOf(BaseApi);
    expect(api).toBeInstanceOf(InsurerAPI);
  });

  it('should return an error if size is less than 1', () => {
    expect(api).toBeInstanceOf(BaseApi);
    expect(() => api.getInsurers(0)).toThrowError('Invalid page size');
  });

  it('should return a list of insurers in an observable', (done) => {
    const numInsurers = 3;
    mockDoGetAjaxRequest.mockImplementation(() => {
      return of({
        data: {
          insurers: [mockInsurer, mockInsurer, mockInsurer],
          nextPageToken: '',
        },
      });
    });

    expect(ApiGateway).toHaveBeenCalled();

    api.getInsurers(numInsurers).subscribe({
      next: (response) => {
        const { data } = response;
        expect(data?.insurers.length).toEqual(numInsurers);
        expect(data?.insurers[0]).toEqual(mockInsurer);
        expect(data?.nextPageToken).toEqual('');
      },
      complete: () => done(),
    });

    expect(mockDoGetAjaxRequest).toHaveBeenCalled();
  });

  it('should return an Insurer in an Observable', (done) => {
    mockDoGetAjaxRequest.mockImplementation(() => {
      return of({
        data: mockInsurer,
      });
    });

    expect(ApiGateway).toHaveBeenCalled();

    api.getInsurer(INSURER_NAME).subscribe({
      next: (response) => {
        const { data } = response;
        expect(data?.name).toEqual(INSURER_NAME);
        expect(data?.displayName).toEqual(DISPLAY_NAME);
        expect(data?.order).toEqual(ORDER);
      },
      complete: () => done(),
    });

    expect(mockDoGetAjaxRequest).toHaveBeenCalled();
  });
});
