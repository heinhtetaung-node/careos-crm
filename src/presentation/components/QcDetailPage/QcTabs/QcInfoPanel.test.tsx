import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { countDownInit as mockCountDownInit } from 'data/slices/qcSlice/reducer';
import mockAddonsResponse from 'mock-data/AddOns.mock';
import { MockInsurers } from 'mock-data/Insurers.mock';
import { OrderDetail, mockOrderDetail } from 'mock-data/OrderDetail.mock';
import qcAnswersFromApiMock, { qcAnswersMock } from 'mock-data/QcAnswers.mock';
import MockUploadedDocuments from 'mock-data/UploadedDocuments.mock';
import {
  init,
  QcContext,
  qcReducer,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/QcContext';
import { store } from 'presentation/redux/store';
import { PackageType, OrderQcStatus } from 'shared/constants/orderType';
import getApiEndpoint from 'utils/endpointHelper';

import QcInfoPanel from './QcInfoPanel';

import { getI18InsurerName, packageType } from '../hooks/usePackagesInfo';

var mockCountDown: any;
var mockUseGetQcDetail: jest.Mock;
var mockUseParams: jest.Mock;

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('react-router-dom', () => {
  mockUseParams = jest.fn();
  return {
    ...(jest.requireActual('react-router-dom') as any),
    useParams: mockUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    }),
  };
});

jest.mock('data/slices/qcSlice', () => ({
  ...jest.requireActual('data/slices/qcSlice'),
  useLazyGetQCAddOnsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isSuccess: true,
      isError: false,
      isLoading: false,
      data: mockAddonsResponse,
    },
  ]),
}));

jest.mock('data/slices/orderSlice', () => ({
  ...jest.requireActual('data/slices/orderSlice'),
  useGetAllOrderDocumentsByStreamingQuery: jest.fn().mockReturnValue({
    isSuccess: true,
    isError: false,
    isLoading: false,
    data: MockUploadedDocuments,
  }),
}));

jest.mock('data/slices/qcSlice/selector', () => {
  mockCountDown = mockCountDownInit({
    answers: {},
    orderDetail: mockOrderDetail,
  });
  mockUseGetQcDetail = jest.fn().mockReturnValue({
    orderDetail: mockOrderDetail,
    countdown: mockCountDown?.countdown,
    answers: {},
  });
  return {
    useGetQcDetail: mockUseGetQcDetail,
  };
});

jest.mock('presentation/components/QcDetailPage/helpers/question', () => ({
  ...jest.requireActual(
    'presentation/components/QcDetailPage/helpers/question'
  ),
  titleTextInAllLanguages: jest
    .fn()
    .mockReturnValue([
      'mr',
      'mrs',
      'miss',
      'khun',
      'นาย',
      'นาง',
      'นางสาว',
      'คุณ',
    ]),
}));

const localStorageMock = (() => {
  let localStore: Record<string, string> = {};
  return {
    getItem: (key: string) => localStore[key],
    setItem: jest.fn().mockImplementation((key: string, value: string) => {
      localStore[key] = value.toString();
    }),
    clear: () => {
      localStore = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  getI18n: () => ({
    t(str: string) {
      return str;
    },
    language: 'th',
  }),
}));
const setTab = jest.fn();

const storeRef = setupApiStore(apiSlice);
function ComponentWithContext({
  answers = {},
  orderDetail = OrderDetail,
}: any) {
  const [state, dispatch] = React.useReducer(
    qcReducer,
    { answers, countdown: {}, orderDetail },
    init
  );

  const contextValue = React.useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return (
    <QcContext.Provider value={contextValue}>
      <Provider store={{ ...storeRef.store, ...store }}>
        <QcInfoPanel setTab={setTab} />
      </Provider>
    </QcContext.Provider>
  );
}

describe.skip('Test <QcInfoPanel/>', () => {
  it('Test getI18InsurerName return thai full name', () => {
    const { displayName, displayNameTh, shortnameEn, shortnameTh } =
      MockInsurers.insurers[MockInsurers.insurers.length - 1];
    expect(
      getI18InsurerName({
        displayName,
        displayNameTh,
        shortnameEn,
        shortnameTh,
      })
    ).toBe('บริษัท อลิอันซ์ ประกันภัย จำกัด (มหาชน)');
  });

  it('Test <QcInfoPanel/> render successfully', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId:getQC`,
        () => HttpResponse.json({}, { status: 404 })
      )
    );
    await Promise.resolve(true);
    render(<ComponentWithContext orderDetail={OrderDetail} />);
    const policyHolderInfo = await screen.findByText(
      'qc.customerIsInsuredPerson'
    );
    const informRenewal = await screen.findAllByText('qc.informPremiumRenewal');
    const mandatoryPolicy = await screen.findAllByText('qc.mandatory');

    // mandatory text under Premium and Packages, get mandatory under Packages
    expect(mandatoryPolicy[0]).toBeInTheDocument();
    expect(policyHolderInfo).toBeInTheDocument();
    // customer renewal text under Premium and Packages, get customer renewal under Packages
    expect(informRenewal[0]).toBeInTheDocument();
    const qcApproveButton = await screen.findAllByTestId('qc-approve-btn');
    await userEvent.click(qcApproveButton[2]);
    expect(setTab).toHaveBeenCalled();
    const qcRejectButton = await screen.findAllByTestId('qc-reject-btn');
    await userEvent.click(qcRejectButton[10]);
    expect(screen.getByTestId('sales-needs-to-fix')).toBeInTheDocument();
    // show policy holder DOB when feature turned on and policy holder is not a company.
    expect(screen.getByText('21/01/2000')).toBeInTheDocument();
  });

  it('Test <QcInfoPanel/> render with policyholder is a company', async () => {
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

    mockUseGetQcDetail.mockReturnValue({
      orderDetail: mockCompanyOrderData,
      countdown: mockCountDown?.countdown,
      answers: {},
    });
    render(<ComponentWithContext orderDetail={mockCompanyOrderData} />);
    const policyCompanyAndTaxID = await screen.findByText(
      'Rabbit Care, 19998858855'
    );
    expect(policyCompanyAndTaxID).toBeInTheDocument();
  });

  it('Test <QcInfoPanel/> render <PackageDetails/> dialog and show mandatory package successfully', async () => {
    render(<ComponentWithContext />);
    const seeDetailsButtons = await screen.findAllByText('qc.seeDetails');
    await userEvent.click(seeDetailsButtons[0]);

    const dialog = await screen.findByRole('dialog');

    const mandatoryPackage = within(dialog).getByText('qc.mandatory');

    expect(mandatoryPackage).toBeInTheDocument();
  });

  it('Test <QcInfoPanel/> render <PackageDetails/> dialog and show voluntary package successfully', async () => {
    render(<ComponentWithContext />);
    // find See Details button and click to open the dialog
    const seeDetailsButtons = await screen.findAllByText('qc.seeDetails');
    await userEvent.click(seeDetailsButtons[1]);

    const dialog = await screen.findByRole('dialog');

    const voluntaryPackageSection = within(dialog).getByText('qc.ownCarDamage');
    const sumInsured = within(dialog).getByText('qc.sumInsured');
    const deductible = within(dialog).getByText('qc.deductible');
    const fireAndTheft = within(dialog).getByText('qc.fireAndTheft');

    expect(voluntaryPackageSection).toBeInTheDocument();
    expect(sumInsured).toBeInTheDocument();
    expect(deductible).toBeInTheDocument();
    expect(fireAndTheft).toBeInTheDocument();
  });

  it('Test <QcInfoPanel/> show correct package type', async () => {
    render(<ComponentWithContext />);
    const renewalType = await screen.findByText(
      packageType[PackageType.RENEWAL]
    );
    expect(renewalType).toBeInTheDocument();
  });

  it('Test show proper address', async () => {
    render(<ComponentWithContext />);
    await waitFor(() => {
      const policyHolderAddress = screen.queryByText(
        'Test Address updated, พระบรมมหาราชวัง, พระนคร, กรุงเทพมหานคร 10200'
      );
      const shippingAddress = screen.queryByText('qc.usePolicyAddress');
      const billingAddress = screen.queryByText('qc.usePolicyAddress');
      expect(policyHolderAddress).toBeInTheDocument();
      expect(shippingAddress).toBeInTheDocument();
      expect(billingAddress).toBeInTheDocument();
    });
  });

  test('Test <QcInfoPanel/> show correct province in vehicle info panel', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces/:province`,
        () =>
          HttpResponse.json({
            name: 'provinces/100000',
            nameEn: 'Bangkok',
            nameTh: 'กรุงเทพมหานคร',
          })
      )
    );

    render(<ComponentWithContext />);
    const licensePlateAndProvince = await screen.findByText(
      'กพ 1234 กท, กรุงเทพมหานคร'
    );
    await waitFor(() => {
      expect(licensePlateAndProvince).toBeInTheDocument();
    });
  });

  // NOTE: fix test after demo
  it('Test <UpdateDataMyself/> and <SalesNeedtoFix/> hide and show according when user switch options', async () => {
    render(<ComponentWithContext />);

    const edit = screen.queryAllByTestId('qc-edit-input')[3];
    const editButton = within(edit).queryByRole('button') as HTMLElement;
    expect(editButton).not.toBeNull();
    await userEvent.click(editButton);

    let updateForm = await screen.findByTestId('update-data-myself-form');
    expect(updateForm).toBeInTheDocument();

    let radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]);

    await waitForElementToBeRemoved(() =>
      screen.getAllByTestId('update-data-myself-form')
    );

    const salesFixForm = await screen.findByTestId('sales-needs-to-fix-form');
    expect(salesFixForm).toBeInTheDocument();

    radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]);

    await waitForElementToBeRemoved(() =>
      screen.getAllByTestId('sales-needs-to-fix-form')
    );

    updateForm = await screen.findByTestId('update-data-myself-form');
    expect(updateForm).toBeInTheDocument();
  });

  it('Should check/cross button disabled when QC is approved', async () => {
    const OrderApproved = OrderDetail;
    OrderApproved.order.qcStatus = OrderQcStatus.APPROVED;
    mockUseGetQcDetail.mockReturnValue({
      orderDetail: OrderApproved,
      countdown: mockCountDown?.countdown,
      answers: {},
    });
    render(
      <ComponentWithContext
        answers={qcAnswersMock}
        orderDetail={OrderApproved}
      />
    );
    const qcApproveButton = await screen.findAllByTestId('qc-approve-btn');
    const qcRejectButton = await screen.findAllByTestId('qc-reject-btn');

    expect(qcApproveButton[2]).toBeDisabled();
    expect(qcRejectButton[5]).toBeDisabled();
  });

  it('Should driver info panel disabled', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { firstDriverDOB, secondDriverDOB, ...newData } =
      OrderDetail.order.data;
    const NewOrderDetail = {
      ...OrderDetail,
      order: {
        data: newData,
      },
    };

    render(<ComponentWithContext orderDetail={NewOrderDetail} />);
    const firstDriverApprovedBtn = screen
      .getByTestId('approved-driversOneFullNameAndAge')
      .closest('button') as HTMLButtonElement;
    const secondDriverApprovedBtn = screen
      .getByTestId('approved-driversTwoFullNameAndAge')
      .closest('button') as HTMLButtonElement;
    expect(firstDriverApprovedBtn).toHaveAttribute('disabled');
    expect(secondDriverApprovedBtn).toHaveAttribute('disabled');
  });

  it('Should check/cross button disabled when QC is rejected but with API call to fetch qc questions', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId:getQC`,
        () => HttpResponse.json(qcAnswersFromApiMock)
      )
    );
    const rejectedOrder = OrderDetail;
    rejectedOrder.order.qcStatus = OrderQcStatus.REJECTED;
    mockUseGetQcDetail.mockReturnValue({
      orderDetail: rejectedOrder,
      countdown: mockCountDown?.countdown,
      answers: {},
    });
    await Promise.resolve(true);

    render(<ComponentWithContext orderDetail={rejectedOrder} />);
    const qcApproveButton = await screen.findAllByTestId('qc-approve-btn');
    const qcRejectButton = await screen.findAllByTestId('qc-reject-btn');
    await waitFor(() => {
      expect(qcApproveButton[2]).toBeDisabled();
      expect(qcRejectButton[5]).toBeDisabled();
    });
  });

  it('Should show warning for title in policyHolder name', async () => {
    const OrderTitleInName = OrderDetail;
    OrderTitleInName.order.data.policyHolder.firstName = 'คุณดนัย';
    mockUseGetQcDetail.mockReturnValue({
      orderDetail: OrderTitleInName,
      countdown: mockCountDown?.countdown,
      answers: {},
    });
    await Promise.resolve(true);

    render(<ComponentWithContext orderDetail={OrderTitleInName} />);
    expect(screen.getByTestId('qc-question-chip')).toBeInTheDocument();
  });
});

describe('Test <QcInfoPanel /> uncheck question', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem.mockClear();
    store.dispatch(apiSlice.util.resetApiState());
  });

  it('Should QC question be able to uncheck (normal question)', async () => {
    const pendingOrder = OrderDetail;
    pendingOrder.order.qcStatus = OrderQcStatus.PENDING;

    mockUseGetQcDetail.mockReturnValue({
      orderDetail: pendingOrder,
      countdown: mockCountDown?.countdown,
      answers: {
        policyHolderDifferentitation: { answer: true, isCritical: true },
      },
    });

    server.use(
      http.get(
        getApiEndpoint(`api/order/v1alpha1/orders/:orderId:getQC`),
        (_) => HttpResponse.json({}, { status: 404 })
      )
    );

    render(<ComponentWithContext orderDetail={pendingOrder} />);
    const approvedBtn = (
      await screen.findByTestId('approved-policyHolderDifferentitation')
    ).parentElement?.parentElement as HTMLButtonElement;
    expect(approvedBtn).toBeInTheDocument();

    // Should uncheck normal question
    await userEvent.click(approvedBtn);
    expect(
      JSON.parse(localStorage.getItem('new_qc_questions') as string)
    ).toStrictEqual({
      'b5843e5c-8196-4d39-97c5-0700adc8a3f3': {},
    });
  });

  it.skip('Should QC package question be able to uncheck', async () => {
    mockUseGetQcDetail.mockReturnValue({
      orderDetail: OrderDetail,
      countdown: mockCountDown?.countdown,
      answers: {
        'orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3/items/8cb5eb26-bd54-4cfb-b1b5-7df423830b31':
          {
            packageType: { answer: true, isCritical: true },
          },
      },
    });

    render(<ComponentWithContext orderDetail={OrderDetail} />);
    const packageTypeCheck = screen.getByTestId('approved-packageType')
      .parentElement?.parentElement as HTMLButtonElement;
    expect(packageTypeCheck).toBeInTheDocument();

    await userEvent.click(packageTypeCheck);
    expect(
      JSON.parse(localStorage.getItem('new_qc_questions') as string)
    ).toStrictEqual({
      'b5843e5c-8196-4d39-97c5-0700adc8a3f3': {},
    });
  });
});
