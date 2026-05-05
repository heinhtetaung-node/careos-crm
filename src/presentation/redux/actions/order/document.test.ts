import {
  CreateOrderDocumentActionTypes,
  createOrderDocument,
  deleteDocument,
  createOrderDocumentSuccess,
  createOrderDocumentFail,
  deleteDocumentSuccess,
  deleteDocumentFail,
  getUploadedDocuments,
  getUploadedDocumentsSuccess,
  getUploadedDocumentsFail,
} from 'presentation/redux/actions/order/document';

const payload = { a: 'test ' };

describe('Order Activity Comment Actions', () => {
  it('Should dispatch create order document action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT,
      payload,
    };
    expect(createOrderDocument(payload)).toEqual(action);
  });

  it('Should dispatch create order document success action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT_SUCCESS,
      payload,
    };
    expect(createOrderDocumentSuccess(payload)).toEqual(action);
  });

  it('Should dispatch create order document fail action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT_FAIL,
      error: payload,
    };
    expect(createOrderDocumentFail(payload)).toEqual(action);
  });

  it('Should dispatch delete order document action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT,
      payload,
    };
    expect(deleteDocument(payload)).toEqual(action);
  });

  it('Should dispatch delete order document success action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT_SUCCESS,
      payload,
    };
    expect(deleteDocumentSuccess(payload)).toEqual(action);
  });

  it('Should dispatch delete order document fail action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT_FAIL,
      error: payload,
    };
    expect(deleteDocumentFail(payload)).toEqual(action);
  });

  it('Should dispatch delete order document action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS,
      payload,
    };
    expect(getUploadedDocuments(payload)).toEqual(action);
  });

  it('Should dispatch delete order document success action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS_SUCCESS,
      payload,
    };
    expect(getUploadedDocumentsSuccess(payload)).toEqual(action);
  });

  it('Should dispatch delete order document fail action', () => {
    const action = {
      type: CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS_FAIL,
      error: payload,
    };
    expect(getUploadedDocumentsFail(payload)).toEqual(action);
  });
});
