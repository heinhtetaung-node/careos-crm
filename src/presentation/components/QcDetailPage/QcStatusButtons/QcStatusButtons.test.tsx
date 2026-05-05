import userEvent from '@testing-library/user-event';
import _set from 'lodash/set';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  providerProps,
  renderWithContext,
  screen,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import { OrderDetail, mockOrderDetail } from 'mock-data/OrderDetail.mock';
import { qcAnswersMock, mockQcAnswers } from 'mock-data/QcAnswers.mock';
import {
  mockAdminRole,
  mockAdminUserInfo,
  mockAdminWhoami,
  mockSalesRole,
  mockSalesUserInfo,
  mockSalesWhoami,
} from 'mock-data/UserData.mock';
import { OrderQcStatus } from 'shared/constants/orderType';

import QcStatusButtons from './QcStatusButtons';

var mockUseGetQcDetail: jest.Mock;
var mockQcUpdate: jest.Mock;

const spyFetch = jest.spyOn(window, 'fetch');

beforeEach(() => {
  spyFetch.mockClear();
});

jest.mock('data/slices/qcSlice/selector', () => {
  mockUseGetQcDetail = jest.fn().mockReturnValue({
    orderDetail: mockOrderDetail,
    answers: mockQcAnswers,
    countdown: {
      address: [],
    },
  });
  return {
    useGetQcDetail: mockUseGetQcDetail,
  };
});

describe('Test normal QC button', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/dev/.ory/kratos/sessions/whoami`,
        () => HttpResponse.json(mockAdminWhoami)
      ),
      http.get(`${process.env.VITE_API_ENDPOINT}/oauth2/userinfo`, () =>
        HttpResponse.json(mockAdminUserInfo)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/ee139ec2-5c0d-4877-83d1-174ade5f932e`,
        () => HttpResponse.json(mockAdminRole)
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId:qc`,
        () => HttpResponse.json(mockQcUpdate())
      )
    );
  });

  it('Should render QcStatusButtons with no answers in context', async () => {
    const noAnswers = {
      value: {
        state: {
          orderDetail: OrderDetail,
          answers: {},
          countdown: {
            address: [],
          },
        },
        dispatch: () => null,
      },
    };
    renderWithContext(
      <div>
        <QcStatusButtons orderId="b5843e5c-8196-4d39-97c5-0700adc8a3f3" />
      </div>,
      { providerProps: noAnswers }
    );
    const qcButtonApprove = await screen.findByTestId('qc-status-approve');
    expect(qcButtonApprove).toBeInTheDocument();
  });

  it('Should render QcStatusButtons with context', async () => {
    renderWithContext(
      <div>
        <QcStatusButtons orderId="b5843e5c-8196-4d39-97c5-0700adc8a3f3" />
      </div>,
      { providerProps }
    );
    const qcButtonApprove = await screen.findByTestId('qc-status-approve');
    expect(qcButtonApprove).toBeInTheDocument();
  });

  it('Should Pass QC button enable', async () => {
    renderWithContext(
      <div>
        <QcStatusButtons orderId="b5843e5c-8196-4d39-97c5-0700adc8a3f3" />
      </div>,
      { providerProps }
    );
    const passQcButton = await screen.findByTestId('qc-status-approve');
    expect(passQcButton).not.toHaveAttribute('disabled');
  });

  it.skip('Should Pass QC call pass claimCondition answer to true while flag enable', async () => {
    const orderDetailCompany = _set(
      OrderDetail,
      'order.data.policyHolder.isCompany',
      true
    );
    const orderCompany = {
      value: {
        state: {
          orderDetail: orderDetailCompany,
          answers: qcAnswersMock,
          countdown: {
            address: [],
          },
        },
        dispatch: () => null,
      },
    };
    renderWithContext(
      <div>
        <QcStatusButtons orderId="b5843e5c-8196-4d39-97c5-0700adc8a3f3" />
      </div>,
      { providerProps: orderCompany }
    );
    const passQcButton = await screen.findByTestId('qc-status-approve');
    expect(passQcButton).toBeEnabled();
    await userEvent.click(passQcButton);
    const commentArea = screen.getByTestId('common-textfield');
    await userEvent.type(commentArea, 'approved');

    await userEvent.click(screen.getByText('text.save'));

    await Promise.resolve();
    expect(spyFetch).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        _bodyInit: expect.stringContaining(
          JSON.stringify('claimConditionsExplanation')
        ),
      })
    );
    expect(spyFetch).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        _bodyInit: expect.stringContaining(
          JSON.stringify('correctPolicyHolderDOB')
        ),
      })
    );
  });

  it('Should Fail QC button enable', async () => {
    const answersFail = {
      value: {
        state: {
          orderDetail: OrderDetail,
          answers: {
            ...qcAnswersMock,
            driversOneFullNameAndAge: {
              answer: false,
              isCritical: true,
            },
          },
          countdown: {
            address: [],
          },
        },
        dispatch: () => null,
      },
    };

    mockUseGetQcDetail.mockReturnValue({
      orderDetail: mockOrderDetail,
      answers: {
        ...mockQcAnswers,
        driversOneFullNameAndAge: {
          answer: false,
          isCritical: true,
        },
      },
      countdown: {
        address: [],
      },
    });

    renderWithContext(
      <div>
        <QcStatusButtons orderId="b5843e5c-8196-4d39-97c5-0700adc8a3f3" />
      </div>,
      { providerProps: answersFail }
    );
    const failQcButton = await screen.findByTestId('qc-status-reject');
    expect(failQcButton).not.toHaveAttribute('disabled');

    await userEvent.click(failQcButton);
  });

  it.skip('Should call submit handle function', async () => {
    mockUseGetQcDetail.mockReturnValue({
      orderDetail: mockOrderDetail,
      answers: mockQcAnswers,
      countdown: {
        address: [],
      },
    });
    renderWithContext(
      <div>
        <QcStatusButtons orderId="b5843e5c-8196-4d39-97c5-0700adc8a3f3" />
      </div>,
      { providerProps }
    );

    const passQcButton = await screen.findByTestId('qc-status-approve');
    await userEvent.click(passQcButton);
    const presentation = screen.getByRole('presentation');
    expect(presentation).toBeTruthy();

    const commentBox = within(presentation).getByTestId('common-textfield');
    await userEvent.type(commentBox, 'example comment');

    await userEvent.click(
      await within(presentation).findByTestId('form-button')
    );
    await waitForElementToBeRemoved(presentation);

    expect(mockQcUpdate).toHaveBeenCalled();
  });
});

describe('Test issuesFixed button', () => {
  const RejectedOrder = {
    value: {
      state: {
        orderDetail: {
          ...OrderDetail,
          order: {
            ...OrderDetail.order,
            qcStatus: OrderQcStatus.REJECTED,
          },
        },
        answers: qcAnswersMock,
        countdown: {
          address: [],
        },
      },
      dispatch: () => null,
    },
  };

  it('Should issuesFixed button display', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/dev/.ory/kratos/sessions/whoami`,
        () => HttpResponse.json(mockSalesWhoami)
      ),
      http.get(`${process.env.VITE_API_ENDPOINT}/oauth2/userinfo`, () =>
        HttpResponse.json(mockSalesUserInfo)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/ee139ec2-5c0d-4877-83d1-174ade5f933e`,
        () => HttpResponse.json(mockSalesRole)
      )
    );

    mockUseGetQcDetail.mockReturnValue({
      orderDetail: {
        ...mockOrderDetail,
        order: {
          ...mockOrderDetail.order,
          qcStatus: OrderQcStatus.REJECTED,
        },
      },
      answers: mockQcAnswers,
      countdown: {
        address: [],
      },
    });

    renderWithContext(
      <div>
        <QcStatusButtons orderId="b5843e5c-8196-4d39-97c5-0700adc8a3f3" />
      </div>,
      { providerProps: RejectedOrder }
    );
    const issuesFixedBtn = await screen.findByTestId('issues-fixed-btn');
    expect(issuesFixedBtn).toBeInTheDocument();
    await userEvent.click(issuesFixedBtn);
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
});
