import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import callParticipants from 'mock-data/CallParticipants.mock';
import mockedLeadScripts from 'mock-data/LeadScripts.mock';
import { OrderDetail } from 'mock-data/OrderDetail.mock';

import { QC_QUESTIONS_KEY, transformPackageAnswers } from './QcContext';

import QcDetailPage from '.';

var mockedUseParams: jest.Mock;

// Mock routes to avoid circular dependency issues
jest.mock('presentation/routes', () => ({
  sidebar: [],
  healthSidebar: [],
  travelSidebar: [],
}));

jest.mock('shared/constants/headerRoutes', () => ({
  __esModule: true,
  default: [],
  emptyHeaderRoutes: [],
  healthHeaderRoutes: () => [],
}));

jest.mock('react-router-dom', () => {
  mockedUseParams = jest.fn();
  return {
    ...(jest.requireActual('react-router-dom') as any),
    useParams: mockedUseParams,
    useLocation: jest.fn().mockReturnValue({
      pathname: '/orders/qc/7e9216af-1e3f-42ea-a5b9-17d1d53926a8g',
      search: '',
      state: undefined,
      hash: '',
    }),
  };
});

const savedItems = {
  '2b7e2e7e-4791-466b-b28b-18daa3a88c83': {
    introductionCompanyAndAgent: true,
    informBrokerLicense: true,
    informConversationRecording: false,
    driversTwoFullNameAndAge: true,
    addressBilling: true,
    addressShipping: true,
    addressPolicyHolder: true,
    'orders/595fb026-6eb1-42d6-b806-4a64babd50ba/items/9bffd0c4-80af-4e23-8e1b-87eb1651c548':
      {
        coverageDetailCorrect: false,
        policyStartDate: true,
        premium: true,
        packageType: true,
        sumInsured: true,
      },
  },
  '66dcc810-7fec-4e7c-b9d1-ec8311aaf9e2': {
    endingSalutation: true,
    endingAskForAvailability: false,
    introductionCompanyAndAgent: true,
    informBrokerLicense: true,
    informConversationRecording: true,
    permissionToRecordConversation: true,
  },
};

const scrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

describe('Render QcDetailPage', () => {
  beforeEach(() => {
    scrollIntoView.mockClear();
    localStorage.setItem(QC_QUESTIONS_KEY, JSON.stringify(savedItems));
  });

  it('with error', async () => {
    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
        () => HttpResponse.json({ error: 'not found' }, { status: 500 })
      )
    );
    mockedUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    });
    await Promise.resolve();
    render(<QcDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('errorPage.notFoundText')).toBeTruthy();
    });
  });

  it.skip('successfully', async () => {
    const mockCompanyOrderData = {
      ...OrderDetail,
      order: {
        ...OrderDetail.order,
        data: {
          ...OrderDetail.order.data,
          policyHolder: {
            ...OrderDetail.order.data.policyHolder,
            isCompany: true,
            isCustomer: false,
            companyName: 'Rabbit Care',
            companyTaxId: '19998858855',
          },
        },
      },
    };

    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
        () => HttpResponse.json(mockCompanyOrderData)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/7d4485a2-e44d-437c-8cd9-b74df8080ae9/scripts`,
        () => HttpResponse.json(mockedLeadScripts)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/calls/-/participants?showDeleted=true&pageSize=1&filter=destination.lead.lead="leads/43487a16-a3ee-4c22-a78e-8ad788753098"`,
        () => HttpResponse.json(callParticipants)
      )
    );

    mockedUseParams.mockReturnValue({
      orderId: '2b7e2e7e-4791-466b-b28b-18daa3a88c83',
      policyId: '',
    });

    await Promise.resolve();

    render(<QcDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('qc-detail-content')).toBeTruthy();
      expect(screen.getByText(/#L9854860/)).toBeInTheDocument();
      expect(screen.getByTestId('order-star-btn')).toBeInTheDocument();
      expect(screen.getByTestId('start-call-button')).toBeInTheDocument();
    });
  });
});

test('Transform packages answers from localstorage in qc context', () => {
  const items = OrderDetail?.items;
  const answers = {
    coverageDetailCorrect: false,
    sumInsured: true,
    'orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3/items/8cb5eb26-bd54-4cfb-b1b5-7df423830b31':
      {
        premium: true,
        policyStartDate: true,
        informedAboutPremiumChangeIfClaimed: true,
        sumInsured: true,
        packageType: true,
        coverageDetailCorrect: true,
      },
    undefined: {
      coverageDetailCorrect: true,
      premium: false,
    },
    premiumRabbitCareDiscounts: false,
    premiumTotalInvoice: true,
  };
  const result = transformPackageAnswers(
    items,
    answers,
    false,
    false,
    false,
    false,
    true,
    true
  );
  /**
   * use toMatchObject to partially match the object
   * allow adding additional fields to question in future without failing test.
   */
  const expectObject = {
    policyStartDate: [
      {
        group: 'qc.policyStartDate',
        isCritical: false,
        label: 'Policy start date',
        name: undefined,
        qId: 'policyStartDate',
        title: 'text.policyStartDate',
      },
    ],
    packages: [],
    premium: [
      {
        group: 'qc.premium',
        groupId: 'premium',
        isCritical: true,
        label: 'qc.rabbitCareDiscount',
        qId: 'premiumRabbitCareDiscounts',
        title: 'text.insurancePackageTitle',
      },
      {
        group: 'qc.premium',
        groupId: 'premium',
        isCritical: true,
        label: 'qc.totalInvoiced',
        qId: 'premiumTotalInvoice',
        title: 'text.insurancePackageTitle',
      },
    ],
  };
  expect(result).toMatchObject(expectObject);

  // When payment is offline but not answer it yet
  const resultWithOfflinePayment = transformPackageAnswers(
    items,
    answers,
    false,
    false,
    false,
    true,
    false,
    false
  );
  expect(resultWithOfflinePayment).toMatchObject({
    ...expectObject,
    premium: [
      ...expectObject.premium,
      {
        group: 'qc.premium',
        isCritical: true,
        label: 'qc.paymentHasDocuments',
        qId: 'paymentHasDocuments',
        title: 'text.insurancePackageTitle',
      },
      {
        group: 'qc.premium',
        groupId: 'premium',
        isCritical: true,
        qId: 'installmentSuccessful',
        title: 'qc.problemWithInstallment',
      },
    ],
  });
});
