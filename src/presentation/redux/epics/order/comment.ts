import { ofType } from 'redux-observable';
import { merge, of, forkJoin } from 'rxjs';
import {
  map,
  exhaustMap,
  catchError,
  switchMap,
  mergeMap,
  pluck,
} from 'rxjs/operators';

import LookUpUserUsecase from 'domain/usecases/admin/user/lookUpUserUseCase';
import OrderUseCase from 'domain/usecases/order';
import {
  OrderCommentTypes,
  createOrderCommentFail,
  createOrderCommentSuccess,
  getCommentSuccess,
  getCommentFail,
  getCommentAfterCreate,
  getCommentAfterCreateSuccess,
  getCommentAfterCreateFail,
} from 'presentation/redux/actions/order/comment';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getCommentData } from 'presentation/redux/epics/leadActivity/helper';
import { getString } from 'presentation/theme/localization';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import getCommentName from './commentEpicHelper';

export const createOrderCommentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(OrderCommentTypes.CREATE_ORDER_COMMENT),
    exhaustMap((action: any) =>
      new OrderUseCase.CreateOrderCommentUseCase().execute(action.payload).pipe(
        pluck('data'),
        mergeMap((res) =>
          merge(
            of(createOrderCommentSuccess(res)),
            of(
              getCommentAfterCreate({
                users: { pageSize: 200 },
                comments: {
                  params: { pageSize: 5, pageIndex: 1 },
                  name: getCommentName,
                },
              })
            ),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.pushCommentSuccess'),
                status: 'success',
              })
            )
          )
        ),
        catchError((error) =>
          merge(
            of(createOrderCommentFail(error)),
            of(
              showSnackBar({
                isOpen: true,
                message: error._message,
                status: 'error',
              })
            )
          )
        )
      )
    )
  );

export const getCommentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(OrderCommentTypes.GET_COMMENT),
    switchMap((action: any) =>
      forkJoin([
        new LookUpUserUsecase().execute(),
        new OrderUseCase.GetCommentUseCase().execute(action.payload.comments),
      ]).pipe(
        map((res: any) => getCommentSuccess(getCommentData(res))),
        catchError((error: any) => of(getCommentFail(error.toString())))
      )
    )
  );

export const getCommentAfterCreateEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(OrderCommentTypes.GET_COMMENT_AFTER_CREATE),
    switchMap((action: any) =>
      forkJoin([
        new LookUpUserUsecase().execute(),
        new OrderUseCase.GetCommentUseCase().execute(action.payload.comments),
      ]).pipe(
        map((res: any) => getCommentAfterCreateSuccess(getCommentData(res))),
        catchError((error: any) =>
          of(getCommentAfterCreateFail(error.toString()))
        )
      )
    )
  );
