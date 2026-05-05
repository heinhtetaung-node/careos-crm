import { renderHook } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  useAppSelector,
  useAppDispatch,
} from 'presentation/redux/hooks/typedHooks';

import useOrderWithInsurers from '..';

// Mock the Redux hooks at the top
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

// Mock the Redux action
jest.mock('presentation/redux/actions/orders/all', () => ({
  getInsurersAll: jest.fn(() => ({ type: 'GET_INSURERS_ALL' })),
}));

const mockInsurers = [
  {
    name: 'insurers/24',
    displayName: 'Thaisri Insurance Public Company Limited',
    shortnameEn: '',
    shortnameTh: '',
    rating: 0,
    order: 3,
  },
  {
    name: 'insurers/25',
    displayName: 'Test Insurance Company',
    shortnameEn: '',
    shortnameTh: '',
    rating: 0,
    order: 4,
  },
];

// Create a minimal mock store
const createMockStore = () =>
  configureStore({
    reducer: {
      ordersReducer: (state = { insurersAllReducer: { data: mockInsurers } }) =>
        state,
    },
  });

describe('useOrderWithInsurers - Lines 49-57 Coverage', () => {
  let mockStore: any;

  beforeEach(() => {
    mockStore = createMockStore();
    (useAppSelector as jest.Mock).mockImplementation(() => mockInsurers);
    (useAppDispatch as jest.Mock).mockImplementation(() => jest.fn());
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={mockStore}>{children}</Provider>
  );

  it('should use order.insurer directly when insurer name has numeric ID (line 49-57: numeric case)', () => {
    const mockOrders = [
      {
        id: 'test-order-1',
        orderId: 'O750',
        orderCreated: new Date(),
        isCompany: false,
        convertBy: '',
        customer: 'Test Customer',
        licensePlate: 'กฉ-2868',
        earliestPolicyStartDate: '10/11/2022',
        insuredPerson: 'Test Person',
        documentsStatus: { status: '', label: '', type: '' },
        companyName: '',
        documentStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
        submissionStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        approvalStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        isStar: false,
        products: [
          {
            name: 'test-product',
            createTime: '2021-12-30T09:49:57.415968Z',
            updateTime: '2021-12-31T17:14:30.548234Z',
            deleteTime: null,
            product: 'products/car-insurance',
            package: 'package/test',
            price: '100000',
            grossPremium: '100000',
            netPremium: '0',
            vatPercent: 0,
            vatAmount: '10000',
            stampDutyPercentage: 0,
            stampDuty: '0',
            addons: [],
            documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
            qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
            submissionStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            approvalStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            discounts: [],
            motorItemType: 'MOTOR_TYPE_2_PLUS',
            isCancelled: false,
            submissionBy: '',
            approvalBy: '',
            submitDate: '0001-01-01T00:00:00Z',
            insurer: 'insurers/24',
            humanId: 'O750-1',
            adjustedPremium: '0',
            sumInsured: '0',
            policyHolder: 'Test Policy Holder',
            productType: 'Type 2+',
            premium: '100000',
            documentsStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            warningLbl: 'Active',
            policyRef: 'TEST123_1',
          },
        ],
        isChecked: false,
        assignedTo: '',
        insurancePackage: [''],
        salesAgent: '',
        policyStartDate: '',
        deliveryOption: '',
        timeSinceDocumentsComplete: '',
        website: '',
        paymentTerms: '',
        paymentStatus: false,
        totalNetPremium: '',
        totalInvoiced: '',
        discount: '',
        // Test case: order.insurer with numeric name (insurers/123) should use order.insurer directly
        insurer: {
          name: 'insurers/123',
          displayName: 'Test Insurer 123',
        },
      },
    ];

    const { result } = renderHook(() => useOrderWithInsurers(mockOrders), {
      wrapper,
    });

    // Wait for the effect to complete
    const order = result.current.orderDataWithInsurers[0] as any;

    // Should use order.insurer directly when the name has a numeric ID
    expect(order.insurer).toEqual({
      name: 'insurers/123',
      displayName: 'Test Insurer 123',
    });
  });

  it('should find insurer from insurers array when insurer name is non-numeric (line 49-57: non-numeric case)', () => {
    const mockOrders = [
      {
        id: 'test-order-2',
        orderId: 'O751',
        orderCreated: new Date(),
        isCompany: false,
        convertBy: '',
        customer: 'Test Customer',
        licensePlate: 'กฉ-2869',
        earliestPolicyStartDate: '10/11/2022',
        insuredPerson: 'Test Person',
        documentsStatus: { status: '', label: '', type: '' },
        companyName: '',
        documentStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
        submissionStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        approvalStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        isStar: false,
        products: [
          {
            name: 'test-product',
            createTime: '2021-12-30T09:49:57.415968Z',
            updateTime: '2021-12-31T17:14:30.548234Z',
            deleteTime: null,
            product: 'products/car-insurance',
            package: 'package/test',
            price: '100000',
            grossPremium: '100000',
            netPremium: '0',
            vatPercent: 0,
            vatAmount: '10000',
            stampDutyPercentage: 0,
            stampDuty: '0',
            addons: [],
            documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
            qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
            submissionStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            approvalStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            discounts: [],
            motorItemType: 'MOTOR_TYPE_2_PLUS',
            isCancelled: false,
            submissionBy: '',
            approvalBy: '',
            submitDate: '0001-01-01T00:00:00Z',
            insurer: 'insurers/24',
            humanId: 'O751-1',
            adjustedPremium: '0',
            sumInsured: '0',
            policyHolder: 'Test Policy Holder',
            productType: 'Type 2+',
            premium: '100000',
            documentsStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            warningLbl: 'Active',
            policyRef: 'TEST123_1',
          },
        ],
        isChecked: false,
        assignedTo: '',
        insurancePackage: [''],
        salesAgent: '',
        policyStartDate: '',
        deliveryOption: '',
        timeSinceDocumentsComplete: '',
        website: '',
        paymentTerms: '',
        paymentStatus: false,
        totalNetPremium: '',
        totalInvoiced: '',
        discount: '',
        // Test case: order.insurer with non-numeric name (insurers/abc) should find from insurers array
        insurer: {
          name: 'insurers/abc',
          displayName: 'Test Insurer ABC',
        },
        item: {
          insurer: 'insurers/24', // This should match with mockInsurers[0].name
        },
      },
    ];

    const { result } = renderHook(() => useOrderWithInsurers(mockOrders), {
      wrapper,
    });

    const order = result.current.orderDataWithInsurers[0] as any;

    // Should find the insurer where insurer.name === order.item.insurer (insurers/24)
    expect(order.insurer).toEqual(mockInsurers[0]);
  });

  it('should handle case when order.insurer.name is undefined (line 49-57: undefined case)', () => {
    const mockOrders = [
      {
        id: 'test-order-3',
        orderId: 'O752',
        orderCreated: new Date(),
        isCompany: false,
        convertBy: '',
        customer: 'Test Customer',
        licensePlate: 'กฉ-2870',
        earliestPolicyStartDate: '10/11/2022',
        insuredPerson: 'Test Person',
        documentsStatus: { status: '', label: '', type: '' },
        companyName: '',
        documentStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
        submissionStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        approvalStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        isStar: false,
        products: [
          {
            name: 'test-product',
            createTime: '2021-12-30T09:49:57.415968Z',
            updateTime: '2021-12-31T17:14:30.548234Z',
            deleteTime: null,
            product: 'products/car-insurance',
            package: 'package/test',
            price: '100000',
            grossPremium: '100000',
            netPremium: '0',
            vatPercent: 0,
            vatAmount: '10000',
            stampDutyPercentage: 0,
            stampDuty: '0',
            addons: [],
            documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
            qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
            submissionStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            approvalStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            discounts: [],
            motorItemType: 'MOTOR_TYPE_2_PLUS',
            isCancelled: false,
            submissionBy: '',
            approvalBy: '',
            submitDate: '0001-01-01T00:00:00Z',
            insurer: 'insurers/24',
            humanId: 'O752-1',
            adjustedPremium: '0',
            sumInsured: '0',
            policyHolder: 'Test Policy Holder',
            productType: 'Type 2+',
            premium: '100000',
            documentsStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            warningLbl: 'Active',
            policyRef: 'TEST123_1',
          },
        ],
        isChecked: false,
        assignedTo: '',
        insurancePackage: [''],
        salesAgent: '',
        policyStartDate: '',
        deliveryOption: '',
        timeSinceDocumentsComplete: '',
        website: '',
        paymentTerms: '',
        paymentStatus: false,
        totalNetPremium: '',
        totalInvoiced: '',
        discount: '',
        // Test case: order.insurer with undefined name should find from insurers array
        insurer: {
          name: undefined,
          displayName: 'Test Insurer Undefined',
        },
        item: {
          insurer: 'insurers/24',
        },
      },
    ];

    const { result } = renderHook(() => useOrderWithInsurers(mockOrders), {
      wrapper,
    });

    const order = result.current.orderDataWithInsurers[0] as any;

    // When order.insurer.name is undefined, it should find from insurers array
    expect(order.insurer).toEqual(mockInsurers[0]);
  });

  it('should handle case when order.insurer is null (line 49-57: null case)', () => {
    const mockOrders = [
      {
        id: 'test-order-4',
        orderId: 'O753',
        orderCreated: new Date(),
        isCompany: false,
        convertBy: '',
        customer: 'Test Customer',
        licensePlate: 'กฉ-2871',
        earliestPolicyStartDate: '10/11/2022',
        insuredPerson: 'Test Person',
        documentsStatus: { status: '', label: '', type: '' },
        companyName: '',
        documentStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
        submissionStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        approvalStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        isStar: false,
        products: [
          {
            name: 'test-product',
            createTime: '2021-12-30T09:49:57.415968Z',
            updateTime: '2021-12-31T17:14:30.548234Z',
            deleteTime: null,
            product: 'products/car-insurance',
            package: 'package/test',
            price: '100000',
            grossPremium: '100000',
            netPremium: '0',
            vatPercent: 0,
            vatAmount: '10000',
            stampDutyPercentage: 0,
            stampDuty: '0',
            addons: [],
            documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
            qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
            submissionStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            approvalStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            discounts: [],
            motorItemType: 'MOTOR_TYPE_2_PLUS',
            isCancelled: false,
            submissionBy: '',
            approvalBy: '',
            submitDate: '0001-01-01T00:00:00Z',
            insurer: 'insurers/24',
            humanId: 'O753-1',
            adjustedPremium: '0',
            sumInsured: '0',
            policyHolder: 'Test Policy Holder',
            productType: 'Type 2+',
            premium: '100000',
            documentsStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            warningLbl: 'Active',
            policyRef: 'TEST123_1',
          },
        ],
        isChecked: false,
        assignedTo: '',
        insurancePackage: [''],
        salesAgent: '',
        policyStartDate: '',
        deliveryOption: '',
        timeSinceDocumentsComplete: '',
        website: '',
        paymentTerms: '',
        paymentStatus: false,
        totalNetPremium: '',
        totalInvoiced: '',
        discount: '',
        // Test case: order.insurer is null should find from insurers array
        insurer: null,
        item: {
          insurer: 'insurers/24',
        },
      },
    ];

    const { result } = renderHook(() => useOrderWithInsurers(mockOrders), {
      wrapper,
    });

    const order = result.current.orderDataWithInsurers[0] as any;

    // When order.insurer is null, it should find from insurers array
    expect(order.insurer).toEqual(mockInsurers[0]);
  });

  it('should handle case when no matching insurer is found (line 49-57: no match case)', () => {
    const mockOrders = [
      {
        id: 'test-order-5',
        orderId: 'O754',
        orderCreated: new Date(),
        isCompany: false,
        convertBy: '',
        customer: 'Test Customer',
        licensePlate: 'กฉ-2872',
        earliestPolicyStartDate: '10/11/2022',
        insuredPerson: 'Test Person',
        documentsStatus: { status: '', label: '', type: '' },
        companyName: '',
        documentStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
        submissionStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        approvalStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        isStar: false,
        products: [
          {
            name: 'test-product',
            createTime: '2021-12-30T09:49:57.415968Z',
            updateTime: '2021-12-31T17:14:30.548234Z',
            deleteTime: null,
            product: 'products/car-insurance',
            package: 'package/test',
            price: '100000',
            grossPremium: '100000',
            netPremium: '0',
            vatPercent: 0,
            vatAmount: '10000',
            stampDutyPercentage: 0,
            stampDuty: '0',
            addons: [],
            documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
            qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
            submissionStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            approvalStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            discounts: [],
            motorItemType: 'MOTOR_TYPE_2_PLUS',
            isCancelled: false,
            submissionBy: '',
            approvalBy: '',
            submitDate: '0001-01-01T00:00:00Z',
            insurer: 'insurers/24',
            humanId: 'O754-1',
            adjustedPremium: '0',
            sumInsured: '0',
            policyHolder: 'Test Policy Holder',
            productType: 'Type 2+',
            premium: '100000',
            documentsStatus: {
              label: 'Unassigned',
              status: 'warning',
              type: 'text',
            },
            warningLbl: 'Active',
            policyRef: 'TEST123_1',
          },
        ],
        isChecked: false,
        assignedTo: '',
        insurancePackage: [''],
        salesAgent: '',
        policyStartDate: '',
        deliveryOption: '',
        timeSinceDocumentsComplete: '',
        website: '',
        paymentTerms: '',
        paymentStatus: false,
        totalNetPremium: '',
        totalInvoiced: '',
        discount: '',
        // Test case: order.insurer with non-numeric name but no matching insurer
        insurer: {
          name: 'insurers/xyz',
          displayName: 'Test Insurer XYZ',
        },
        item: {
          insurer: 'insurers/nonexistent', // This doesn't match any insurer in mockInsurers
        },
      },
    ];

    const { result } = renderHook(() => useOrderWithInsurers(mockOrders), {
      wrapper,
    });

    const order = result.current.orderDataWithInsurers[0] as any;

    // When no matching insurer is found, it should return undefined
    expect(order.insurer).toBeUndefined();
  });
});
