import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import SelectorUseCase from 'domain/usecases/document';
import {
  UploadDocumentActionTypes,
  uploadDocumentSuccess,
  uploadDocumentFail,
} from 'presentation/redux/actions/document';
import { showSnackBar } from 'presentation/redux/actions/ui';
import * as CONSTANTS from 'shared/constants';
import { epicWithoutStateFn, IAction } from 'shared/interfaces/common';

const createDocumentSelectorEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UploadDocumentActionTypes.UPLOAD_DOCUMENT),
    switchMap((action: IAction<any>) =>
      new SelectorUseCase.UploadDocument(action.payload).execute().pipe(
        map((res) => uploadDocumentSuccess(res)),
        catchError((error) =>
          of(
            uploadDocumentFail(error.toString()),
            showSnackBar({
              isOpen: true,
              message: error.message,
              status: CONSTANTS.snackBarConfig.type.error,
            })
          )
        )
      )
    )
  );

export default createDocumentSelectorEpic;
