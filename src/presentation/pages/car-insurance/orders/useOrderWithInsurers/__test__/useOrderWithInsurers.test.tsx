import { renderHook } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { of, throwError } from 'rxjs';

import { store } from 'presentation/redux/store';

import useOrderWithInsurers from '..';

const mockInsurers = [
  {
    name: 'insurers/24',
    displayName: 'Thaisri Insurance Public Company Limited',
    shortnameEn: '',
    shortnameTh: '',
    rating: 0,
    order: 3,
  },
];

const mockOrders = [
  {
    id: '98b41af2-c2cf-4eba-bf9d-4e94344c64ef',
    orderId: 'O750',
    orderCreated: new Date(),
    isCompany: false,
    convertBy: '',
    customer: 'New DCwan testQA',
    licensePlate: 'กฉ-2868',
    earliestPolicyStartDate: '10/11/2022',
    insuredPerson: 'ทองใบ กุลดี',
    documentsStatus: { status: '', label: '', type: '' },
    companyName: '',
    documentStatus: {
      label: 'Unassigned',
      status: 'warning',
      type: 'text',
    },
    qcStatus: {
      label: 'Unassigned',
      status: 'warning',
      type: 'text',
    },
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
        name: 'orders/98b41af2-c2cf-4eba-bf9d-4e94344c64ef/items/f8e94348-f263-4a1f-ac2d-54356902c02a',
        createTime: '2021-12-30T09:49:57.415968Z',
        updateTime: '2021-12-31T17:14:30.548234Z',
        deleteTime: null,
        product: 'products/car-insurance',
        package: 'package/232323232',
        price: '232323',
        grossPremium: '2323232',
        netPremium: '0',
        vatPercent: 0,
        vatAmount: '223232323',
        stampDutyPercentage: 0,
        stampDuty: '0',
        addons: [],
        documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
        qcStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
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
        policyHolder: 'Puipui testDOC Testsri',
        productType: 'Type 2+',
        premium: '2323232',
        documentsStatus: {
          label: 'Unassigned',
          status: 'warning',
          type: 'text',
        },
        warningLbl: 'Cancelled',
        policyRef: 'O324562_2',
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
  },
];

var mockGetInsurers = (size: number) => {
  if (size < 1) throwError('Invalid page size');
  return of({ data: { insurers: mockInsurers } });
};

jest.mock('data/gateway/api/services/insurer', () =>
  jest.fn().mockImplementationOnce(() => ({
    getInsurers: mockGetInsurers,
  }))
);

// FIXME
xdescribe('Test useOrderWithInsurers custom hook', () => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store as any}>{children}</Provider>
  );
  it('useOrderWithInsurers properly map order with insurers', () => {
    const {
      result: {
        current: { orderDataWithInsurers },
      },
    } = renderHook(() => useOrderWithInsurers(mockOrders), {
      wrapper,
    });
    const product = orderDataWithInsurers[0].products[0];

    expect(product.insurer).toBe(mockInsurers[0].displayName);
  });
});
