import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import GenerateTracking from './GenerateTracking';

import { getErrorMsg } from '../helper';

const handleError = jest.fn();

var mockDispatch: jest.Mock;
jest.mock('react-redux', () => {
  mockDispatch = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

beforeEach(() => {
  mockDispatch.mockClear();
});

describe('Test <GenerateTracking/> ', () => {
  it('render disabled button', () => {
    render(<GenerateTracking handleError={handleError} orders={[]} />);
    const button = screen.getByTestId('generate-tracking-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('render button and trigger warning when not all policies selected', async () => {
    render(<GenerateTracking handleError={handleError} orders={[]} />, {
      initialState: {
        selectionsReducer: {
          selectedPolicies: [
            {
              orderId: 'orders/b3053769-873b-4df7-8299-38da6df52d1d',
              items: [
                'orders/b3053769-873b-4df7-8299-38da6df52d1d/items/ae287fda-70cd-4ba0-98da-a52dc6a76f95',
              ],
              approvalStatuses: ['POLICY_UPLOADED'],
              insurers: [],
              noOfPolicies: 2,
            },
          ],
        },
      },
    });
    const button = screen.getByTestId('generate-tracking-button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId('warning-modal')).toBeInTheDocument();
    });
  });

  it('render button and trigger create shipment', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/orders/:orderId/shipments`,
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      )
    );
    render(
      <GenerateTracking
        handleError={handleError}
        originalArgs={{ params: '', assignedTo: '' }}
        orders={[
          {
            order: {
              name: 'orders/9826e5ca-8a87-4966-8b16-3f2524983009',
              lead: 'leads/ddbb9f0c-9e38-41bb-a507-a1152da28122',
              createTime: '2022-10-26T07:54:04.718672Z',
              updateTime: '2022-10-26T10:22:35.818746Z',
              deleteTime: null,
              convertBy: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
              supervisor: 'users/5dfb2174-75ed-4180-a257-6b893a71b08f',
              isCancelled: false,
              product: 'products/car-insurance',
              invoicePrice: '200000',
              humanId: 'L9886619',
              discounts: '[]',
              payment: '',
              customer: 'customers/3e75feaa-3672-459b-8d03-3356b464c0ff',
              schema: 'orderSchemas/a85f07e5-071f-460d-842c-aa9e37edbed2',
              data: '{carDashCam: false, carLicensePlate: "กพ-9882 กท", …}',
              documentBy: 'users/707e9a30-328a-4f14-bd45-b0f28239708f',
              documentStatus: 'DOCUMENT_STATUS_PENDING',
              qcBy: 'users/6af202ec-b63a-484d-bb30-0be70cb16533',
              qcStatus: 'QC_STATUS_PENDING',
              isUrgentDelivery: false,
              isFullyPaid: false,
              cancelTime: '1970-01-01T00:00:00Z',
            },
            items: [],
            id: 'b3053769-873b-4df7-8299-38da6df52d1d',
          },
        ]}
      />,
      {
        initialState: {
          selectionsReducer: {
            selectedPolicies: [
              {
                orderId: 'orders/b3053769-873b-4df7-8299-38da6df52d1d',
                items: [
                  'orders/b3053769-873b-4df7-8299-38da6df52d1d/items/ae287fda-70cd-4ba0-98da-a52dc6a76f95',
                ],
                approvalStatuses: ['POLICY_UPLOADED'],
                insurers: [],
                noOfPolicies: 1,
              },
            ],
          },
        },
      }
    );
    const button = screen.getByTestId('generate-tracking-button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    userEvent.click(button);
    await Promise.resolve(true);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it('render button and handle create shipment error', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/orders/:orderId/shipments`,
        () =>
          HttpResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
          )
      )
    );
    render(
      <GenerateTracking
        handleError={handleError}
        orders={[
          {
            order: {
              name: 'orders/9826e5ca-8a87-4966-8b16-3f2524983009',
              lead: 'leads/ddbb9f0c-9e38-41bb-a507-a1152da28122',
              createTime: '2022-10-26T07:54:04.718672Z',
              updateTime: '2022-10-26T10:22:35.818746Z',
              deleteTime: null,
              convertBy: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
              supervisor: 'users/5dfb2174-75ed-4180-a257-6b893a71b08f',
              isCancelled: false,
              product: 'products/car-insurance',
              invoicePrice: '200000',
              humanId: 'L9886619',
              discounts: '[]',
              payment: '',
              customer: 'customers/3e75feaa-3672-459b-8d03-3356b464c0ff',
              schema: 'orderSchemas/a85f07e5-071f-460d-842c-aa9e37edbed2',
              data: '{carDashCam: false, carLicensePlate: "กพ-9882 กท", …}',
              documentBy: 'users/707e9a30-328a-4f14-bd45-b0f28239708f',
              documentStatus: 'DOCUMENT_STATUS_PENDING',
              qcBy: 'users/6af202ec-b63a-484d-bb30-0be70cb16533',
              qcStatus: 'QC_STATUS_PENDING',
              isUrgentDelivery: false,
              isFullyPaid: false,
              cancelTime: '1970-01-01T00:00:00Z',
            },
            items: [],
            id: 'b3053769-873b-4df7-8299-38da6df52d1d',
          },
        ]}
      />,
      {
        initialState: {
          selectionsReducer: {
            selectedPolicies: [
              {
                orderId: 'orders/b3053769-873b-4df7-8299-38da6df52d1d',
                items: [
                  'orders/b3053769-873b-4df7-8299-38da6df52d1d/items/ae287fda-70cd-4ba0-98da-a52dc6a76f95',
                ],
                approvalStatuses: ['POLICY_UPLOADED'],
                insurers: [],
                noOfPolicies: 1,
              },
            ],
          },
        },
      }
    );
    const button = screen.getByTestId('generate-tracking-button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    userEvent.click(button);
    await waitFor(() => {
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(handleError).toHaveBeenCalled();
    });
  });
});

describe('Test getErrorMsg return error message for ', () => {
  it('policy approval status error', () => {
    expect(
      getErrorMsg(
        'cannot create shipment for L9885991-1. Policy documents not ready'
      )
    ).toEqual('text.policyNotUploadedErrorMsg');
  });
  it('order that is not fully paid', () => {
    expect(
      getErrorMsg(
        'cannot create courier shipment for voluntary policies. Order not fully paid'
      )
    ).toEqual('text.orderNotFullyPaidErrorMsg');
  });
  it('generic error', () => {
    expect(getErrorMsg('text.error')).toEqual('text.error');
  });
});
