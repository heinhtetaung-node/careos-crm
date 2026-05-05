import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import * as Redux from 'react-redux';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  ComponentWithProvider,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import { mockDates, mockDays } from 'mock-data/OrderScheduleModalSlice.mock';
import { initialState } from 'mock-data/ReduxStore.mock';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import {
  getCallParticipants,
  subscribeLeadUpdates,
} from 'presentation/redux/actions/leads/detail';
import { OrderActionTypes } from 'presentation/redux/actions/order';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';
import { getLeadIdFromLeadName } from 'shared/helper/utilities';
import FeatureFlags from 'config/flagsmithConfig';

import MyOrderDetailPage from '.';

var mockGetAppointment: jest.Mock;

const MockOrderDetail = {
  name: 'orders/4d0a4576-dc60-4415-abb2-28e0c5c3c200',
  lead: 'leads/19dc3129-0b08-4317-892c-a4e1aaa6717c',
  createTime: '2022-11-04T08:35:44.334616Z',
  updateTime: '2022-11-08T03:47:18.839647Z',
  deleteTime: null,
  convertBy: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
  supervisor: 'users/5dfb2174-75ed-4180-a257-6b893a71b08f',
  isCancelled: false,
  product: 'products/car-insurance',
  invoicePrice: '200000',
  humanId: 'L9888452',
  discounts: [],
  payment: '',
  customer: 'customers/7c0285a0-b776-406e-9493-3712f1a6fe0f',
  schema: 'orderSchemas/a85f07e5-071f-460d-842c-aa9e37edbed2',
  data: {
    carDashCam: true,
    carLicensePlate: '7กภ-898',
    carModified: false,
    carSubModelYear: 4,
    carUsageType: 'personal',
    chassisNumber: 'ABC1112222',
    docsShipmentMethod: 'Courier',
    engineNumber: 'ENG0009999',
    firstDriverDOB: '1993-01-11',
    firstDriverName: 'Driver One',
    idNumber: '1222200062261',
    idType: 'DrivingLicense',
    isRedPlate: false,
    numberOfSeats: 4,
    oicCode: '110',
    policyHolder: {
      billingAddress: {
        address: 'ชั้น 40 S Bangsue Rd',
        addressType: 'personal',
        district: 102800,
        fullName: 'ชั้น 40 S Bangsue Rd, Bangkok',
        postCode: 10120,
        province: 100000,
        subDistrict: 102802,
      },
      communicationLanguage: 'th-th',
      companyName: 'Rabbit',
      companyTaxId: '123456',
      dateOfBirth: '1993-01-21',
      firstName: 'Cypress',
      gender: 'm',
      isCompany: false,
      isCustomer: false,
      lastName: 'TestQA',
      nationalID: '1816524775067',
      policyAddress: {
        address: 'Test Address',
        addressType: 'personal',
        companyName: 'Company A',
        district: 100100,
        fullName: 'Cypress Address',
        isBillingAddress: true,
        isShippingAddress: false,
        postCode: 10200,
        province: 100000,
        subDistrict: 100101,
        taxId: '121212',
      },
      shippingAddress: {
        address: 'ชั้น 29 1 S Sathon Rd',
        addressType: 'personal',
        district: 102800,
        fullName: 'ชั้น 29 1 S Sathon Rd, Thung Maha Mek, Sathon, Bangkok',
        postCode: 10120,
        province: 100000,
        subDistrict: 102802,
      },
      title: 'MR',
    },
    registeredProvince: 100000,
    secondDriverDOB: '1992-02-15',
    secondDriverName: 'Driver two',
    vehicleColor: ['orange', 'dark blue', 'yellow'],
  },
  documentBy: '',
  documentStatus: 'DOCUMENT_STATUS_PENDING',
  qcBy: '',
  qcStatus: 'QC_STATUS_APPROVED',
  isUrgentDelivery: false,
  isFullyPaid: false,
  cancelTime: '1970-01-01T00:00:00Z',
};

const MockCar = {
  name: 'brands/1/models/1/submodels/1/years/4',
  year: 2010,
  sumInsuredMin: 10150000,
  sumInsuredMax: 5402000,
  fuelType: 'Petrol',
  month: 1,
  redbookId: 'ASTO10AF',
  migratedAsCurated: false,
  price: '1450000000',
  displayName:
    'Aston Martin  V8  2010  Coupe 2dr Vantage SMac 6sp Rear Wheel Drive 4.3i (CBU)',
  engineSize: 0,
  isEnabled: true,
};

const MockCustomer = {
  name: 'customers/7c0285a0-b776-406e-9493-3712f1a6fe0f',
  createTime: '2022-09-20T08:57:18.328571Z',
  updateTime: '2022-11-08T05:02:09.487216Z',
  deleteTime: null,
  createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
  humanId: 'C1030589',
  firstName: 'Oriol',
  lastName: 'Molist',
  gender: 'M',
  dateOfBirth: '1994-09-01T00:00:00Z',
  companyNames: [],
  primaryPhoneId:
    'customers/7c0285a0-b776-406e-9493-3712f1a6fe0f/phones/be40ee71-5bca-4fa9-bf6f-a3c79fba9f06',
};

jest.mock('data/slices/leadDetailSlices/appointmentSlice', () => {
  mockGetAppointment = jest.fn();
  return {
    ...jest.requireActual('data/slices/leadDetailSlices/appointmentSlice'),
    useLazyGetAppointmentsQuery: jest.fn().mockReturnValue([
      mockGetAppointment,
      {
        isUninitialized: false,
        isFetching: false,
        isSuccess: true,
        data: {
          start: mockDates[0],
          length: 6,
          days: mockDays,
        },
      },
    ]),
  };
});

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: {
      role: 'roles/sales-agent',
    },
  })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    orderId: '12345',
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('presentation/components/CallButtonLiveKit', () => ({
  __esModule: true,
  default: () => <div data-testid="call-button-livekit">CallButtonLiveKit</div>,
}));

jest.mock('presentation/components/CallButtonV2', () => ({
  __esModule: true,
  default: () => <div data-testid="call-button-v2">CallButtonV2</div>,
}));

const mockUseFlags = jest.fn().mockReturnValue({});
jest.mock('flagsmith/react', () => ({
  useFlags: () => mockUseFlags(),
  FlagsmithProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const dispatch = jest.fn();
(Redux.useDispatch as any).mockReturnValue(dispatch);

afterEach(() => {
  mockGetAppointment.mockClear();
});

test('Should open appointment with gff endpoint schedule if flag (ORDER_2501 is on)', async () => {
  render(<MyOrderDetailPage />, { initialState });

  const appointmentBtn = await screen.findByTestId('schedule-modal');
  await userEvent.click(appointmentBtn);

  const presentation = await screen.findByRole('presentation');
  expect(presentation).toBeInTheDocument();
  expect(
    within(presentation).getByText('text.appointmentType')
  ).toBeInTheDocument();
  expect(mockGetAppointment).toHaveBeenCalled();
});

describe.skip('Test <MyOrderDetailPage/>', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/dev/.ory/kratos/sessions/whoami`,
        () =>
          HttpResponse.json({
            identity: { id: 'c9b61bb3-878b-43b2-9ffd-faad6f814390' },
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/:userId`,
        () => HttpResponse.json({ role: 'roles/sales' })
      ),
      http.get(
        `${process.env.VITE_GATEWAY_ENDPOINT}/api/cars/years/:yearId`,
        () => HttpResponse.json(MockCar)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/:customerId`,
        () => HttpResponse.json(MockCustomer)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId`,
        () => HttpResponse.json(MockOrderDetail)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId//documents`,
        () => {
          console.log('docs');
          return HttpResponse.json({
            documents: [
              { type: 'DOCUMENT_TYPE_ID_CARD', label: 'doc-1' },
              { type: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION', label: 'doc-2' },
            ],
          });
        }
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/view/v1alpha1/views/users/users/:userId`,
        () =>
          HttpResponse.json({
            name: 'users/8e6b4b8c-19fb-400f-9925-fe58f5a9829f',
            createTime: '2022-12-16T04:02:00.466816Z',
            updateTime: '2022-12-16T08:31:44.764990Z',
            deleteTime: null,
            createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
            humanId: '7405353004268573@cypress.co.th',
            role: 'roles/sales',
            firstName: 'Automation PATCH',
            lastName: 'BE Test PATCH',
            fullName: 'Automation PATCH BE Test PATCH',
            annotations: {
              lang: 'TH',
            },
            loginTime: null,
            createByFirstName: 'Daniel Boone',
            createByLastName: '-',
            createByFullName: 'Daniel Boone -',
            teamProduct: '',
            teamDisplayName: '',
          })
      )
    );
  });

  test.skip('disabled input but still accessible other action buttons for sales agent', async () => {
    mockUseFlags();
    render(
      <ComponentWithProvider>
        <MyOrderDetailPage />
      </ComponentWithProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Oriol')).toHaveAttribute('readonly');
    });

    let modalCloseBtn = null;
    const phoneModalButton = screen.getByTestId('add-phone-modal');
    const scheduleModalButton = screen.getByTestId('schedule-modal');

    // phone modal dialog can still access
    expect(phoneModalButton).not.toBeDisabled();
    await userEvent.click(phoneModalButton);
    expect(screen.getByTestId('order-add-phone')).toBeInTheDocument();
    modalCloseBtn = screen.getByTestId('close-button');
    await userEvent.click(modalCloseBtn);
    await waitForElementToBeRemoved(screen.getByTestId('order-add-phone'));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(screen.queryByTestId('order-add-phone')!).toBeNull();

    // schedule modal dialog can still access
    expect(scheduleModalButton).not.toBeDisabled();
    await userEvent.click(scheduleModalButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it.skip('Should show fixQcIssues button for sales agent', async () => {
    const stateWithOrderFaieldQc = {
      ...MockOrderDetail,
      qcStatus: 'QC_STATUS_REJECTED',
    };
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId`,
        () => HttpResponse.json(stateWithOrderFaieldQc)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/view/v1alpha1/views/users/users/:userId`,
        () =>
          HttpResponse.json({
            name: 'users/8e6b4b8c-19fb-400f-9925-fe58f5a9829f',
            createTime: '2022-12-16T04:02:00.466816Z',
            updateTime: '2022-12-16T08:31:44.764990Z',
            deleteTime: null,
            createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
            humanId: '7405353004268573@cypress.co.th',
            role: 'roles/sales',
            firstName: 'Automation PATCH',
            lastName: 'BE Test PATCH',
            fullName: 'Automation PATCH BE Test PATCH',
            annotations: {
              lang: 'TH',
            },
            loginTime: null,
            createByFirstName: 'Daniel Boone',
            createByLastName: '-',
            createByFullName: 'Daniel Boone -',
            teamProduct: '',
            teamDisplayName: '',
          })
      )
    );

    render(
      <ComponentWithProvider>
        <MyOrderDetailPage />
      </ComponentWithProvider>
    );
    const fixQcIssuesBtn = await screen.findByTestId('fix-qc-issues-btn');
    expect(fixQcIssuesBtn).toBeInTheDocument();
  });

  describe('call functionality', () => {
    const dispatch: jest.Mock = jest.fn();

    const renderWithCallStatus = (callStatus = CallStatus.Idle) => {
      render(<MyOrderDetailPage />, {
        initialState: {
          ...initialState,
          leadsDetailReducer: {
            ...initialState.leadsDetailReducer,
            callReducer: {
              data: {
                callStatus,
                callName: 'calls/xxx',
                sdpAnswerResource: 'answer-resource',
              },
            },
          },
        },
      });
    };

    beforeEach(() => {
      mockUseFlags([
        'tc-669_enable_call_feature_for_order_details_page_20221010',
      ]);
    });

    afterEach(() => dispatch?.mockReset());

    it('should show the call button', async () => {
      renderWithCallStatus();
      await waitFor(() => {
        expect(screen.getByText('text.message')).toBeInTheDocument();
      });
    });

    // test for deprecated code
    it.skip('should subscribe to webhook once lead has been retrieved', async () => {
      renderWithCallStatus();
      await waitFor(() => {
        const leadName = initialState.order.payload.lead;

        expect(dispatch).toHaveBeenCalledWith({
          type: OrderActionTypes.GET_DETAIL,
          payload: {
            orderName: 'orders/12345',
          },
        });

        expect(dispatch).toHaveBeenCalledWith(
          subscribeLeadUpdates({
            leadName: getLeadIdFromLeadName(leadName),
          })
        );

        expect(dispatch).toHaveBeenCalledWith(
          getLead({
            leadId: getLeadIdFromLeadName(leadName),
          })
        );

        expect(dispatch).toHaveBeenCalledWith(
          getCallParticipants({
            pageSize: 1,
            filter: `destination.lead.lead="${leadName}"`,
          })
        );
      });
    });

    // test for deprecated code
    it.skip('should show the Hang up button when a call is joined', async () => {
      renderWithCallStatus(CallStatus.Join);

      await waitFor(() => {
        expect(screen.getByText('text.hangUp')).toBeInTheDocument();
      });
    });

    it('should show the modal when a call is ended', async () => {
      renderWithCallStatus(CallStatus.End);

      await waitFor(() => {
        expect(screen.getByText('text.summary')).toBeInTheDocument();
      });
    });
  });
});

describe('CallButtonLiveKit Feature Flag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFlags.mockReturnValue({});
  });

  it('should render CallButtonLiveKit when feature flag is enabled', async () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
    });

    render(<MyOrderDetailPage />, { initialState });

    await waitFor(() => {
      expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();
    });
  });

  it('should render CallButtonV2 when feature flag is disabled', async () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
    });

    render(<MyOrderDetailPage />, { initialState });

    await waitFor(() => {
      expect(screen.getByTestId('call-button-v2')).toBeInTheDocument();
    });
  });
});
