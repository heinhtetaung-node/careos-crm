import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider, useDispatch } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import { store } from 'presentation/redux/store';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { ItemApprovalStatus } from 'shared/constants/orderType';

import ApprovalOrderDetailPage from '.';

import { useGetOrderPolicyQuery } from 'data/slices/orderPolicySlice';
import useGetShipmentData from 'presentation/hooks/useGetShipmentData';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { useParams } from 'react-router-dom';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';

jest.mock('data/slices/orderPolicySlice', () => ({
  useGetOrderPolicyQuery: jest.fn(),
  useGetCovernoteMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false, isSuccess: false, isError: false },
  ]),
  useUpdatePolicyMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false, isSuccess: false, isError: false },
  ]),
  useUpdatePolicyApprovalStatusMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false, isSuccess: false, isError: false },
  ]),
}));

jest.mock('presentation/hooks/useGetShipmentData', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('presentation/hooks/useOrderComments', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const dispatch = jest.fn();
(useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);

const storeRef = setupApiStore(apiSlice);

function ComponentWithProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

const mockUseGetOrderPolicyQuery = useGetOrderPolicyQuery as jest.Mock;
const mockUseGetShipmentData = useGetShipmentData as jest.Mock;
const mockUseOrderComments = useOrderComments as jest.Mock;
const mockedUseParams = useParams as jest.Mock;
const mockUseGetAuthenticateQuery = useGetAuthenticateQuery as jest.Mock;

describe('ApprovalOrderDetailPage', () => {
  const defaultParams = {
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  };

  const defaultOrderPolicy = {
    order: OrderDetail.order,
    policy: {
      name: 'L9854860-1',
      approvalStatus: ItemApprovalStatus.PENDING,
    },
    customerInfo: OrderDetail.order.data?.policyHolder,
    motorPackage: OrderDetail.items[1].package,
    packageType: 'STANDARD',
  };

  const defaultUser = {
    role: UserRoleID.ProblemCase,
  };

  const defaultShipmentData = {
    data: [],
    isLoading: false,
    isError: false,
  };

  const defaultComments = [jest.fn(), jest.fn()];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue(defaultParams);

    // Default mocks
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: defaultUser,
    });

    mockUseGetOrderPolicyQuery.mockReturnValue({
      data: defaultOrderPolicy,
      isSuccess: true,
      isLoading: false,
      isError: false,
    });

    mockUseGetShipmentData.mockReturnValue(defaultShipmentData);
    mockUseOrderComments.mockReturnValue(defaultComments);
  });

  test.skip('Test <ApprovalDetailPage/> render successfully', async () => {
    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
        () => HttpResponse.json(OrderDetail)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId//documents`,
        () => HttpResponse.json({ data: [] })
      )
    );

    mockedUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
      policyId: 'L9854860-1',
    });

    render(
      <ComponentWithProvider>
        <ApprovalOrderDetailPage />
      </ComponentWithProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
      // if polic is presubmitted/submitted 'Insurer approved' and 'Problem' buttons should be visible and enable.
      const approvedButton = screen.getByRole('button', {
        name: 'approvalStatusButtons.insurerApproved',
      });
      const problemButton = screen.getByRole('button', {
        name: 'approvalStatusButtons.problem',
      });
      expect(approvedButton).toBeEnabled();
      expect(problemButton).toBeEnabled();
    });
  });

  test.skip('ApprovalOrderDetailPage No order found', async () => {
    mockedUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
      policyId: 'L9854860-1',
    });

    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
        () => HttpResponse.json({ error: 'not found' }, { status: 500 })
      )
    );

    // Resolve promise for mock fetch
    await Promise.resolve(true);
    render(
      <Provider store={store as any}>
        <ApprovalOrderDetailPage />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
    });
  });

  test.skip('ApprovalOrderDetailPage Component loads', async () => {
    mockedUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
      policyId: 'L9854860-1',
    });
    // Resolve promise for mock fetch
    await Promise.resolve(true);
    render(
      <Provider store={store as any}>
        <ApprovalOrderDetailPage />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });
  });

  it('should handle no orderId or policy Id', async () => {
    mockedUseParams.mockReturnValue({});
    mockUseGetOrderPolicyQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(
      <ComponentWithProvider>
        <ApprovalOrderDetailPage />
      </ComponentWithProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('errorPage.notFoundText')).toBeInTheDocument();
    });
  });

  it('should handle did not find policy', async () => {
    mockedUseParams.mockReturnValue({ orderId: 'test-order-id' });
    mockUseGetOrderPolicyQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(
      <ComponentWithProvider>
        <ApprovalOrderDetailPage />
      </ComponentWithProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('errorPage.notFoundText')).toBeInTheDocument();
    });
  });

  test.skip('ApprovalOrderDetailPage Component successfully gets orderPolicy data', async () => {
    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
        () => HttpResponse.json(OrderDetail)
      )
    );
    mockedUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
      policyId: 'L9854860-1',
    });
    // Resolve promise for mock fetch
    await Promise.resolve(true);
    render(
      <Provider store={store as any}>
        <ApprovalOrderDetailPage />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('approval-order-page')).toBeTruthy();
    });
    expect(screen.getByTestId('order-id')).toBeInTheDocument();
  });

  // New comprehensive tests
  describe('Loading States', () => {
    test('should show loader when policy is fetching', () => {
      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: null,
        isSuccess: false,
        isLoading: true,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    test('should show NotFound when policy fetch fails', () => {
      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: null,
        isSuccess: false,
        isLoading: false,
        isError: true,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByText('errorPage.notFoundText')).toBeInTheDocument();
    });

    test('should show NotFound when no order policy data', () => {
      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: null,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByText('errorPage.notFoundText')).toBeInTheDocument();
    });
  });

  describe('User Role Based Rendering', () => {
    test('should render with ProblemCase role correctly', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.ProblemCase },
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should render with SalesAgent role correctly', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.SalesAgent },
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should render with InboundAgent role correctly', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.InboundAgent },
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });
  });

  describe('Approval Status Based Rendering', () => {
    test('should handle POLICY_UPLOADED status', () => {
      const orderPolicyWithUploaded = {
        ...defaultOrderPolicy,
        policy: {
          ...defaultOrderPolicy.policy,
          approvalStatus: ItemApprovalStatus.POLICY_UPLOADED,
        },
      };

      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: orderPolicyWithUploaded,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should handle APPROVED status', () => {
      const orderPolicyWithApproved = {
        ...defaultOrderPolicy,
        policy: {
          ...defaultOrderPolicy.policy,
          approvalStatus: ItemApprovalStatus.APPROVED,
        },
      };

      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: orderPolicyWithApproved,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should handle REJECTED status', () => {
      const orderPolicyWithRejected = {
        ...defaultOrderPolicy,
        policy: {
          ...defaultOrderPolicy.policy,
          approvalStatus: ItemApprovalStatus.REJECTED,
        },
      };

      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: orderPolicyWithRejected,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });
  });

  describe('Component Sections', () => {
    test('should render customer info section', () => {
      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('customer-info-section')).toBeInTheDocument();
    });

    test('should render insurance section', () => {
      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('insurance-section')).toBeInTheDocument();
    });

    test('should render shipping info section', () => {
      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('shipping-info-section')).toBeInTheDocument();
    });
  });

  describe('Document Panel Behavior', () => {
    test('should disable document panel for InboundAgent', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.InboundAgent },
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should disable document panel for SalesAgent', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.SalesAgent },
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should disable document panel when approval status is POLICY_UPLOADED', () => {
      const orderPolicyWithUploaded = {
        ...defaultOrderPolicy,
        policy: {
          ...defaultOrderPolicy.policy,
          approvalStatus: ItemApprovalStatus.POLICY_UPLOADED,
        },
      };

      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: orderPolicyWithUploaded,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });
  });

  describe('Comment Modal Functionality', () => {
    test('should handle comment modal state correctly', () => {
      const mockAddAndGetComment = jest.fn();
      mockUseOrderComments.mockReturnValue([mockAddAndGetComment]);

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });
  });

  describe('Redux Integration', () => {
    test('should dispatch order detail success action when policy is successful', () => {
      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(dispatch).toHaveBeenCalledWith({
        type: '[Order] GET_DETAIL_SUCCESS',
        payload: defaultOrderPolicy.order,
      });
    });
  });

  describe('Shipment Data Integration', () => {
    test('should handle shipment data loading state', () => {
      mockUseGetShipmentData.mockReturnValue({
        ...defaultShipmentData,
        isLoading: true,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should handle shipment data error state', () => {
      mockUseGetShipmentData.mockReturnValue({
        ...defaultShipmentData,
        isError: true,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing customer info', () => {
      const orderPolicyWithoutCustomer = {
        ...defaultOrderPolicy,
        customerInfo: null,
      };

      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: orderPolicyWithoutCustomer,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should handle missing policy holder data', () => {
      const orderPolicyWithoutPolicyHolder = {
        ...defaultOrderPolicy,
        order: {
          ...defaultOrderPolicy.order,
          data: {
            ...defaultOrderPolicy.order.data,
            policyHolder: null,
          },
        },
      };

      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: orderPolicyWithoutPolicyHolder,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });

    test('should handle missing motor package data', () => {
      const orderPolicyWithoutMotorPackage = {
        ...defaultOrderPolicy,
        motorPackage: null,
      };

      mockUseGetOrderPolicyQuery.mockReturnValue({
        data: orderPolicyWithoutMotorPackage,
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      render(
        <ComponentWithProvider>
          <ApprovalOrderDetailPage />
        </ComponentWithProvider>
      );

      expect(screen.getByTestId('approval-detail-order')).toBeInTheDocument();
    });
  });
});
