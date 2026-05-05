import { waitFor } from '@testing-library/react';
import flagsmith from 'flagsmith';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { renderHook } from '__tests__/rtl-test-utils';

import UploadedDocuments from 'mock-data/UploadedDocuments.mock';
import { ShipmentProviders } from 'shared/constants/orderType';
import getApiEndpoint from 'utils/endpointHelper';

import { formatDeliveryOption } from './helper';

import { apiSlice, basePaths } from '../apiSlice';

import {
  fetchDocumentsRecursive,
  useGetAllOrderDocumentsByStreamingQuery,
} from '.';

jest.spyOn(flagsmith, 'getAllFlags').mockReturnValue({
  'order-1473_refactoring-order-search-rtk-slice-to-integrate-users-slice_20221219_temp':
    { enabled: true },
});

describe('Test formatDeliveryOption helper', () => {
  test('Digital delivery method', () => {
    expect(
      formatDeliveryOption({ deliveryOption: ShipmentProviders.EMAIL })
    ).toEqual('qc.deliverByEmail');
  });

  test('With no shipment provider', () => {
    expect(formatDeliveryOption({ deliveryOption: '' })).toEqual('');
  });

  test('Standard delivery method with Kerry', () => {
    expect(
      formatDeliveryOption({
        deliveryOption: ShipmentProviders.COURIER_PROVIDER_KERRY,
      })
    ).toEqual('qc.kerryStandard');
  });

  test('Digital delivery method with Kerry', () => {
    expect(
      formatDeliveryOption({
        deliveryOption: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
      })
    ).toEqual('qc.kerryExpress');
  });
});

describe('Test useGetAllOrderDocumentsByStreamingQuery', () => {
  let wrapperComp!: any;
  beforeEach(() => {
    const storeRefStreaming = setupApiStore(apiSlice);
    wrapperComp = ({ children }: PropsWithChildren) => (
      <Provider store={storeRefStreaming.store}>{children}</Provider>
    );
  });

  test('should useGetAllOrderDocumentsByStreamingQuery return response', async () => {
    server.use(
      http.get(
        getApiEndpoint(`${basePaths.order}/orders/:orderId/documents`),
        () => HttpResponse.json(UploadedDocuments)
      )
    );
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetAllOrderDocumentsByStreamingQuery({
          orderId: 'orders/uuid',
        }),
      { wrapper: wrapperComp }
    );

    const initialResponse = result.current as any;
    expect(initialResponse.data).toBeUndefined();
    expect(initialResponse.isLoading).toBeTruthy();

    await waitForNextUpdate();
    const nextResponse = result.current as any;
    await waitFor(() => {
      expect(nextResponse?.data?.documents).toHaveLength(6);
    });
  });
});

describe('Test fetchDocumentsRecursive', () => {
  test('should fetchDocumentsRecursive return response', async () => {
    let nextPageToken = '1';
    server.use(
      http.get(
        getApiEndpoint(`${basePaths.order}/orders/:orderId/documents`),
        () => {
          nextPageToken = (parseFloat(nextPageToken) + 1).toString();
          if (parseFloat(nextPageToken) > 3) {
            nextPageToken = '';
          }
          return HttpResponse.json({
            ...UploadedDocuments,
            nextPageToken: nextPageToken.toString(),
          });
        }
      )
    );
    const updateCachedData = jest.fn();
    await fetchDocumentsRecursive(
      'orders/uuid',
      '?search=keyword',
      updateCachedData,
      'abcd1234'
    );
    expect(updateCachedData).toHaveBeenCalledTimes(3);
  });
});
