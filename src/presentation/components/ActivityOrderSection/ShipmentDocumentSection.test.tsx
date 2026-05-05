import { act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { hookWaitFor, setupApiStore } from '__tests__/rtl-store';
import {
  ComponentWithProvider,
  render,
  screen,
  waitFor,
} from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { useLazyGetPolicyDocsQuery } from 'data/slices/policyDocsSlice';
import { useLazyGetShipmentDocsQuery } from 'data/slices/shipmentSlice';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import ShipmentMock from 'mock-data/Shipment.mock';
import { PackageType } from 'shared/constants/orderType';

import ShipmentHelper from './helper';
import ShipmentDocumentSection from './ShipmentDocumentSection';

// eslint-disable-next-line import/prefer-default-export
export const documents = [
  {
    name: 'orders/5d2df7d2-6f27-47cd-9bc2-118d2e525b6c/documents/0f14edea-f95d-4871-9c7e-7ceecf6b6cbb',
    createTime: '2021-12-15T07:46:47.004453690Z',
    updateTime: '2021-12-15T07:46:47.004453690Z',
    deleteTime: null,
    createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
    document: 'documents/29f325a2-9262-4f89-93f1-7e71ddfca330',
    type: 'DOCUMENT_TYPE_POLICY',
    label: 'copyPolicyCertificate-Studio Ghibli Wallpaper 74 Pictures.jpeg',
    responseTimes: 590,
  },
  {
    name: 'orders/5d2df7d2-6f27-47cd-9bc2-118d2e525b6c/documents/9edbae9a-90de-4f45-8e08-2e3cb2fb657a',
    createTime: '2021-12-15T07:48:37.373801617Z',
    updateTime: '2021-12-15T07:48:37.373801617Z',
    deleteTime: null,
    createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
    document: 'documents/7ac2c466-052b-4c16-b36e-e227f33190c7',
    type: 'DOCUMENT_TYPE_ENDORSEMENT',
    label:
      'endorsement-HD wallpaper_ Spirited Away characters illustration, Studio Ghibli, My Neighbor Totoro.jpeg',
    responseTimes: 359,
  },
];

describe('<ShipmentDocumentSection/>', () => {
  it('<ShipmentDocumentSection/> render correctly', () => {
    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
        () => HttpResponse.json(OrderDetail)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/documents`,
        () => HttpResponse.json({ documents, nextPageToken: '' }) // TODO: Check the params.set
      )
    );
    render(
      <ComponentWithProvider>
        <ShipmentDocumentSection
          handleDeleteDocument={jest.fn()}
          handleUploadDocument={jest.fn()}
        />
      </ComponentWithProvider>
    );
    expect(screen.getByTestId('shipment-document-section')).toBeTruthy();
  });
  it('<ShipmentDocumentSection/> render correctly with no documents uplaoded', async () => {
    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
        () => HttpResponse.json(OrderDetail)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/documents`,
        () => HttpResponse.json({ documents: [], nextPageToken: '' }) // TODO: Check the params.set
      )
    );
    render(
      <ComponentWithProvider>
        <ShipmentDocumentSection
          handleDeleteDocument={jest.fn()}
          handleUploadDocument={jest.fn()}
        />
      </ComponentWithProvider>
    );

    await userEvent.click(screen.getByTestId('download-all-files'));

    expect(screen.getByTestId('shipment-document-section')).toBeTruthy();
  });
});

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('Test policy shipment documents slice', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers/:insurer/products/car-insurance/documents`,
      (_) => HttpResponse.json(ShipmentMock)
    )
  );
  const { result } = renderHook(() => useLazyGetShipmentDocsQuery(), {
    wrapper,
  });
  const [getShipmentDocs] = result.current;

  await act(async () => {
    await getShipmentDocs({
      insurerId: 'insurers/11',
      packageType: PackageType.STANDARD,
      insuranceType: 'MOTOR_TYPE_1',
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(expect.objectContaining(ShipmentMock));
  });
});

test('Test policy documents slice', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/documents`,
      (_) => HttpResponse.json({ documents, nextPageToken: '' })
    )
  );
  const { result } = renderHook(() => useLazyGetPolicyDocsQuery(), {
    wrapper,
  });
  const [getPolicyDocs] = result.current;

  await act(async () => {
    await getPolicyDocs({
      orderId: '7ac2c466',
      policyId: '7ac2c466as2333',
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(
      expect.objectContaining({
        documents,
        nextPageToken: '',
      })
    );
  });
});

describe('Test ShipmentHelper to get policy id from name', () => {
  it('for a valid policy name returns policy id', () => {
    expect(
      ShipmentHelper.getPolicyIdFromName(
        'orders/2c95bc6e-c4f7-4f6f-b68d-4b8ba483c7ed/items/c5a1e582-af2a-42b9-8db1-ddebd2fa552b'
      )
    ).toEqual('c5a1e582-af2a-42b9-8db1-ddebd2fa552b');
  });
  it('for an empty policy name returns empty string', () => {
    expect(ShipmentHelper.getPolicyIdFromName()).toEqual('');
  });
});
