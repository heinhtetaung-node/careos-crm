import { UploadActionTypes } from 'presentation/redux/actions/leads/upload';
import { IAction } from 'shared/interfaces/common';

const initialState: any = {
  data: {},
  isFetching: false,
  success: true,
  documents: [],
};

export default function createDocumentReducer(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case UploadActionTypes.CREATE_DOCUMENTS_LEADS:
    case UploadActionTypes.DELETE_DOCUMENTS_LEADS:
    case UploadActionTypes.GET_DOCUMENTS_LEADS: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case UploadActionTypes.CREATE_DOCUMENTS_LEADS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        success: true,
        data: {
          ...action.payload,
        },
        documents: [...state.documents, ...[action.payload.data]],
      };
    }
    case UploadActionTypes.CREATE_DOCUMENTS_LEADS_FAILED:
    case UploadActionTypes.DELETE_DOCUMENTS_LEADS_FAILED:
    case UploadActionTypes.GET_DOCUMENTS_LEADS_FAILED: {
      return {
        ...state,
        data: {
          ...action.payload,
        },
        success: false,
        isFetching: false,
      };
    }
    case UploadActionTypes.DELETE_DOCUMENTS_LEADS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        success: true,
        data: {
          ...action.payload,
        },
        documents: state.documents.filter(
          (doc: any) =>
            doc.label.split('-')[0] !== action.payload.data.label.split('-')[0]
        ),
      };
    }
    case UploadActionTypes.GET_DOCUMENTS_LEADS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        success: true,
        data: {
          ...action.payload,
        },
        documents: action.payload.documents,
      };
    }
    default: {
      return state;
    }
  }
}
