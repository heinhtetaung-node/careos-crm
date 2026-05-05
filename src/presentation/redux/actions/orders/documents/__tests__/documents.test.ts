import {
  OrdersDocumentsActions,
  getOrdersDocuments,
  getOrdersDocumentsSuccess,
  getOrdersDocumentsFailed,
  updateAssigneeOrderDocumentList,
} from '..';

it('Should getOrdersDocuments run well', () => {
  expect(
    getOrdersDocuments({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS,
    payload: {
      name: 'DuyNT',
    },
  });
});

it('Should getOrdersDocumentsSuccess run well', () => {
  expect(
    getOrdersDocumentsSuccess({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS_SUCCESS,
    payload: {
      name: 'DuyNT',
    },
  });
});

it('Should getOrdersDocumentsFailed run well', () => {
  expect(
    getOrdersDocumentsFailed({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS_FAILED,
    payload: {
      name: 'DuyNT',
    },
  });
});

it('Should updateAssigneeOrderDocumentList run well', () => {
  expect(
    updateAssigneeOrderDocumentList({
      name: 'DuyNT',
    })
  ).toEqual({
    type: OrdersDocumentsActions.UPDATE_ORDER_LIST,
    payload: {
      name: 'DuyNT',
    },
  });
});
