import { ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { map, switchMap, catchError, mergeAll, pluck } from 'rxjs/operators';

import SelectorUseCase from 'domain/usecases/order';
import {
  CreateOrderDocumentActionTypes,
  createOrderDocumentSuccess,
  createOrderDocumentFail,
  deleteDocumentFail,
  deleteDocumentSuccess,
  getUploadedDocumentsSuccess,
  getUploadedDocumentsFail,
} from 'presentation/redux/actions/order/document';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { epicWithoutStateFn, IAction } from 'shared/interfaces/common';

export const uploadDocumentSelectorEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT),
    switchMap((action: IAction<any>) =>
      new SelectorUseCase.CreateOrderDocument(action.payload).execute().pipe(
        map((res) =>
          merge(
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.createDocumentSuccessfully'),
                status: CONSTANTS.snackBarConfig.type.success,
              })
            ),
            of(createOrderDocumentSuccess(res))
          )
        ),
        mergeAll(),
        catchError((error) => of(createOrderDocumentFail(error.toString())))
      )
    )
  );

export const deleteDocumentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT),
    switchMap((action: IAction<any>) =>
      new SelectorUseCase.DeleteDocumentUseCase(action.payload as any)
        .execute()
        .pipe(
          map((res) =>
            merge(
              of(
                showSnackBar({
                  isOpen: true,
                  message: getString('text.deleteDocumentSuccessfully'),
                  status: CONSTANTS.snackBarConfig.type.success,
                })
              ),
              of(deleteDocumentSuccess(res))
            )
          ),
          mergeAll(),
          catchError((error) => of(deleteDocumentFail(error.toString())))
        )
    )
  );

export const getUploadedDocumentsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS),
    switchMap((action: IAction<any>) =>
      new SelectorUseCase.GetUploadedDocumentsUseCase(action.payload as string)
        .execute()
        .pipe(
          pluck('data'),
          map((res) => getUploadedDocumentsSuccess(res)),
          catchError((error) => of(getUploadedDocumentsFail(error.toString())))
        )
    )
  );
