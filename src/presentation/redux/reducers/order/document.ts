import { CreateOrderDocumentActionTypes } from 'presentation/redux/actions/order/document';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction } from 'shared/interfaces/common';

const initialState: any = {
  ...ReducerHelper.baseReducer(),
  documents: [],
};

export default function (state = initialState, actions: IAction<any>) {
  switch (actions.type) {
    case CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT:
      return ReducerHelper.baseProcessRequest(state, actions);
    case CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT_SUCCESS:
      return {
        ...state,
        success: true,
        documents: [...state.documents, ...[actions.payload.data]],
      };
    case CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT_FAIL:
      return ReducerHelper.baseProcessFailed(state, actions);
    case CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT:
      return ReducerHelper.baseProcessRequest(state, actions);
    case CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT_SUCCESS:
      return {
        ...state,
        success: true,
        documents: state.documents.filter(
          (doc: any) =>
            doc.label.split('-')[0] !== actions.payload.data.label.split('-')[0]
        ),
      };
    case CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT_FAIL:
      return ReducerHelper.baseProcessFailed(state, actions);
    case CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS:
      return ReducerHelper.baseProcessRequest(state, actions);
    case CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        documents: actions.payload.documents,
      };
    case CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS_FAIL:
      return ReducerHelper.baseProcessFailed(state, actions);
    default:
      return state;
  }
}
