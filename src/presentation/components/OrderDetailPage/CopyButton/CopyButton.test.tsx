import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import mockOrderPolicy from 'shared/helper/OrderPolicyMockData';

import CopyButton from '.';

var mockCommentExtractByText: jest.Mock;
const storeRef = setupApiStore(apiSlice);
var mockCommentExtractByText: jest.Mock;

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

jest.mock('./helper.ts', () => {
  mockCommentExtractByText = jest
    .fn()
    .mockReturnValue([
      '99582/รย/22112',
      'รบกวนประสานงานตรวจสภาพรถด่วน \nนัดหมายตรวจสภาพรถยนต์ที่',
    ]);

  const mockGenerateInsurerEmailContent = jest.fn().mockImplementation(
    () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              emailAddress: 'test@insurer.com',
              emailCcs: ['cc@insurer.com', 'Followup@rabbit.co.th'],
              emailSubject: 'Test Subject',
              emailBody:
                'Test Body with applicationNumber: 99582/รย/22112 and remarkToSubmission: รบกวนประสานงานตรวจสภาพรถด่วน',
            }),
          100
        )
      )
  );

  return {
    ...jest.requireActual('./helper.ts'),
    commentExtractByText: mockCommentExtractByText,
    generateInsurerEmailContent: mockGenerateInsurerEmailContent,
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({
    orderId: '9f0cc345-56f3-4dab-b2cd-e7a3172abe9b',
  })),
}));

const writeText: jest.Mock = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText,
  },
});
jest.spyOn(navigator.clipboard, 'writeText');

describe('Test <CopyButton />', () => {
  beforeEach(() => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:orderId`,
        () =>
          HttpResponse.json({
            type: 'LEAD_TYPE_NEW',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha2/orders/:orderId/comments`,
        () =>
          HttpResponse.json({
            comments: [
              {
                text: 'Test comment with เลขรับแจ้ง 99582/รย/22112 and Remark to submission test remark',
                createTime: '2023-02-28T07:30:13.190866Z',
              },
            ],
          })
      )
    );

    act(() => {
      render(
        <CopyButton
          orderPolicy={mockOrderPolicy}
          orderData={OrderDetail as any}
        />,
        { wrapper }
      );
    });

    writeText.mockClear();
    mockCommentExtractByText.mockClear();
  });

  it('Should render copy button', () => {
    expect(screen.getByTestId('copy-policy-button')).toBeInTheDocument();
  });

  it('Should copy policy information to clipboard', async () => {
    const button = await screen.findByRole('button');

    userEvent.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringMatching(/applicationNumber.*?remarkToSubmission/s)
    );
  });
});
