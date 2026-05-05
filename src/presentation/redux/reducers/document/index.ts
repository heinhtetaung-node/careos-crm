import { UploadDocumentActionTypes } from 'presentation/redux/actions/document';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, actions: IAction<any>) {
  switch (actions.type) {
    case UploadDocumentActionTypes.UPLOAD_DOCUMENT_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, actions);
    case UploadDocumentActionTypes.UPLOAD_DOCUMENT_FAIL:
      return ReducerHelper.baseProcessFailed(state, actions);
    default:
      return state;
  }
}
