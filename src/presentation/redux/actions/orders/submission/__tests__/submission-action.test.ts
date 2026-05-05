import {
  OrderSubmissionActions,
  getOrderSubmission,
  getOrderSubmissionSuccess,
  getOrderSubmissionFailed,
  updateAssigneeOrderSubmissionList,
} from '..';

it('Should getOrderSubmission run well', () => {
  expect(
    getOrderSubmission({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrderSubmissionActions.GET_ORDER_SUBMISSION,
    payload: {
      name: 'DuyNT',
    },
  });
});

it('Should getOrderSubmissionSuccess run well', () => {
  expect(
    getOrderSubmissionSuccess({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrderSubmissionActions.GET_ORDER_SUBMISSION_SUCCESS,
    payload: {
      name: 'DuyNT',
    },
  });
});

it('Should getOrderSubmissionFailed run well', () => {
  expect(
    getOrderSubmissionFailed({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrderSubmissionActions.GET_ORDER_SUBMISSION_FAILED,
    payload: {
      name: 'DuyNT',
    },
  });
});

it('Should updateAssigneeOrderSubmissionList run well', () => {
  expect(
    updateAssigneeOrderSubmissionList({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrderSubmissionActions.UPDATE_ORDER_LIST,
    payload: {
      name: 'DuyNT',
    },
  });
});
