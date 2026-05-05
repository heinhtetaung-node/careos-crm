import { http, HttpResponse } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import qcAnswersFromApiMock from 'mock-data/QcAnswers.mock';
import { mockSalesRole, mockSalesWhoami } from 'mock-data/UserData.mock';
import {
  init,
  QcContext,
  qcReducer,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/QcContext';
import { store } from 'presentation/redux/store';
import { OrderQcStatus } from 'shared/constants/orderType';

import QcInfoPanel from './QcInfoPanel';

var mockedUseParams: jest.Mock;
window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('react-router-dom', () => {
  mockedUseParams = jest.fn();
  return {
    ...(jest.requireActual('react-router-dom') as any),
    useParams: mockedUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    }),
  };
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

test.skip('Should sales agent be able to fix wrong answer', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/dev/.ory/kratos/sessions/whoami`,
      () => HttpResponse.json(mockSalesWhoami)
    ),
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/ee139ec2-5c0d-4877-83d1-174ade5f933e`,
      () => HttpResponse.json(mockSalesRole)
    ),
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId:getQC`,
      () => HttpResponse.json(qcAnswersFromApiMock)
    )
  );

  const OrderFailed = OrderDetail;
  OrderFailed.order.qcStatus = OrderQcStatus.REJECTED;

  await Promise.resolve(true);

  render(<ComponentWithContext orderDetail={OrderFailed} />);

  await waitFor(() => {
    const qcApproveButtonEnable = screen.getByTestId(
      'approved-documentGoodQuality'
    )?.parentElement?.parentElement as HTMLButtonElement;
    expect(qcApproveButtonEnable).not.toHaveAttribute('disabled');
  });
});
