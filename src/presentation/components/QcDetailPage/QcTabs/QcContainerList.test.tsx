import _unset from 'lodash/unset';
import React from 'react';
import { useDispatch } from 'react-redux';

import { render, waitFor } from '__tests__/rtl-test-utils';
import { mockOrderDetail } from 'mock-data/OrderDetail.mock';
import { QuestionsList } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';

import QcContainerList from './QcContainerList';

var mockUseGetQcDetail: jest.Mock;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('data/slices/qcSlice/selector', () => {
  mockUseGetQcDetail = jest.fn().mockReturnValue({
    orderDetail: mockOrderDetail,
    countdown: {},
    answers: {},
  });
  return {
    useGetQcDetail: mockUseGetQcDetail,
  };
});

const questionList = [
  {
    qId: 'driversOneFullNameAndAge',
    groupId: 'driver',
    label: 'qc.firstDriver',
    isCritical: true,
    group: 'qc.driver',
    title: 'text.insurancePackageTitle',
  },
] as QuestionsList;

test('Should QcContainerList cover empty driver case', async () => {
  const mockDispatch = jest.fn();
  (useDispatch as any).mockReturnValue(mockDispatch);

  const mockOrderDetailMod = mockOrderDetail;
  _unset(mockOrderDetailMod, 'order.data.firstDriverDOB');

  mockUseGetQcDetail = jest.fn().mockReturnValue({
    orderDetail: mockOrderDetailMod,
    countdown: {},
    answers: {},
  });

  render(
    <QcContainerList
      infoPanels={{ driversOneFullNameAndAge: '-, -, -, -' }}
      questionList={questionList}
      shouldReadonly={false}
      handleQuestionReject={jest.fn()}
      handleQuestionApprove={jest.fn()}
      handleQuestionEdit={jest.fn()}
      setSelectedPackage={jest.fn()}
      setOpenPackageDetails={jest.fn()}
    />
  );

  await waitFor(() => {
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'qcSlice/saveQcAnswers',
      })
    );
  });
});
