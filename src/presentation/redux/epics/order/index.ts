import flagsmith from 'flagsmith';
import _getValue from 'lodash/get';
import { ofType, combineEpics } from 'redux-observable';
import { forkJoin, Observable, of, merge } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  pluck,
  switchMap,
  mergeAll,
  withLatestFrom,
  delayWhen,
} from 'rxjs/operators';

import FeatureFlags from 'config/flagsmithConfig';
import SelectorUseCase from 'domain/usecases/order';
import {
  OrderActionTypes,
  getDetailSuccess,
  getDetailFailed,
  updateOrderSuccess,
  updateOrderFailed,
  updateCustomerSuccess,
  updateCustomerFailed,
  updateDocumentStatusFailed,
  updateDocumentStatusSuccess,
} from 'presentation/redux/actions/order';
import {
  OrdersAllActions,
  getOrdersAllSuccess,
  getOrdersAllFailed,
} from 'presentation/redux/actions/orders/all';
import {
  getOrdersApprovalFailed,
  getOrdersApprovalSuccess,
  OrdersApprovalActions,
} from 'presentation/redux/actions/orders/approval';
import {
  OrdersDocumentsActions,
  getOrdersDocumentsSuccess,
  getOrdersDocumentsFailed,
} from 'presentation/redux/actions/orders/documents';
import {
  QCModuleActions,
  getQCModuleSuccess,
  getQCModuleFailed,
} from 'presentation/redux/actions/orders/qc';
import {
  OrderSubmissionActions,
  getOrderSubmissionSuccess,
  getOrderSubmissionFailed,
} from 'presentation/redux/actions/orders/submission';
import * as CONSTANTS from 'shared/constants';
import {
  epicWithStateFn,
  epicWithDependencies,
} from 'shared/interfaces/common';

import {
  createOrderCommentEpic,
  getCommentEpic,
  getCommentAfterCreateEpic,
} from './comment';
import {
  uploadDocumentSelectorEpic,
  deleteDocumentEpic,
  getUploadedDocumentsEpic,
} from './document';
import getInsurersAllEpic from './insurers';
import isApprovalPage from './orderApprovalHelper';

import { delayLoading } from '../../../../shared/helper/operator';
import { getString } from '../../../theme/localization';
import { showSnackBar } from '../../actions/ui';

interface IOptionalResponse {
  customer?: any;
  supervisor?: any;
  salesAgent?: any;
}

export const fetchOrderEpic: epicWithDependencies = (
  action$,
  state$,
  { apiServices: { OrderApi, CustomerApi, UserApi, CarsApi } }
) =>
  action$.pipe(
    ofType(OrderActionTypes.GET_DETAIL),
    switchMap((action: any) => {
      const orderApi = new OrderApi();
      const isFetchCarDetails = action.payload?.isFetchCarDetails ?? true;
      return orderApi.getOrder(action.payload.orderName).pipe(
        pluck('data'),
        // Waits for the previous Observable to complete before creating the next one
        concatMap((orderResponse: any) => {
          const userApi = new UserApi();
          const { customer, supervisor, data } = orderResponse;
          const sourceObject: Record<string, Observable<any>> = {};
          const carModelYear = _getValue(data, 'carSubModelYear');

          const flags = flagsmith.getAllFlags();

          if (customer) {
            const customerApi = new CustomerApi();
            sourceObject.customer = customerApi.getCustomer(customer);
          }

          if (supervisor) {
            sourceObject.supervisor = userApi.getUser(supervisor);
          }
          if (Object.keys(sourceObject).length) {
            return forkJoin(sourceObject).pipe(
              map((response: IOptionalResponse) => {
                const formattedOrderResponse = { ...orderResponse };
                Object.keys(response).forEach((key) => {
                  formattedOrderResponse[key] =
                    response[key as keyof IOptionalResponse]._data;
                });
                return getDetailSuccess(formattedOrderResponse);
              })
            );
          }

          return of(getDetailSuccess(orderResponse));
        }),
        catchError((error) =>
          of(
            getDetailFailed(error.toString()),
            showSnackBar({
              isOpen: true,
              message: getString('text.errorMessage', {
                message: error.toString(),
              }),
              status: CONSTANTS.snackBarConfig.type.error,
            })
          )
        )
      );
    })
  );

const updateOrderEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(OrderActionTypes.UPDATE_ORDER),
    withLatestFrom(state$.pipe(pluck('order', 'payload'))),
    switchMap(([action, state]) =>
      new SelectorUseCase.UpdateOrderUseCase(action.payload).execute().pipe(
        pluck('data'),
        map((res: any) =>
          merge(
            of(
              showSnackBar({
                isOpen: true,
                message: getString(
                  isApprovalPage
                    ? 'text.updatePolicySuccessfully'
                    : 'text.updateOrderSuccessfully'
                ),
                status: CONSTANTS.snackBarConfig.type.success,
              })
            ),
            of(
              updateOrderSuccess({
                ...state,
                data: res.data,
              })
            )
          )
        ),
        mergeAll(),
        catchError((error) =>
          of(
            updateOrderFailed(),
            showSnackBar({
              isOpen: true,
              message: getString('text.updateOrderFailed', {
                message: error.toString(),
              }),
              status: CONSTANTS.snackBarConfig.type.error,
            })
          )
        )
      )
    )
  );

const updateCustomerEpic: epicWithDependencies = (
  action$,
  state$,
  { apiServices: { CustomerApi } }
) =>
  action$.pipe(
    ofType(OrderActionTypes.UPDATE_CUSTOMER),
    withLatestFrom(state$.pipe(pluck('order', 'payload'))),
    switchMap(([action, state]) => {
      const customerApi = new CustomerApi();
      return customerApi
        .updateCustomer(state.customer.name, action.payload)
        .pipe(
          pluck('data'),
          map((res) =>
            merge(
              of(
                showSnackBar({
                  isOpen: true,
                  message: getString('text.updateOrderSuccessfully'),
                  status: CONSTANTS.snackBarConfig.type.success,
                })
              ),
              of(updateCustomerSuccess(res))
            )
          ),
          mergeAll(),
          catchError((error) =>
            of(
              updateCustomerFailed(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.errorMessage', {
                  message: error.toString(),
                }),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        );
    })
  );

const getOrdersDocumentsEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(OrdersDocumentsActions.GET_ORDERS_DOCUMENTS),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      ),
      state$.pipe(pluck('ordersReducer', 'orderDocumentsReducer', 'pageState'))
    ),
    switchMap(([action, productName, pageState]) => {
      const payload = action.payload.pageSize
        ? { ...action.payload }
        : { ...action.payload, ...pageState };

      return new SelectorUseCase.GetOrdersListUseCase()
        .execute(payload, productName)
        .pipe(
          delayWhen(delayLoading),
          map((res) => getOrdersDocumentsSuccess(res)),
          catchError((err) => of(getOrdersDocumentsFailed(err)))
        );
    })
  );

const getQCModuleEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(QCModuleActions.GET_QC_MODULE),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      ),
      state$.pipe(pluck('ordersReducer', 'qcModuleReducer', 'pageState'))
    ),
    switchMap(([action, productName, pageState]) => {
      const payload = action.payload.pageSize
        ? { ...action.payload }
        : { ...action.payload, ...pageState };

      return new SelectorUseCase.GetOrdersListUseCase()
        .execute(payload, productName)
        .pipe(
          delayWhen(delayLoading),
          map((res) => getQCModuleSuccess(res)),
          catchError((err) => of(getQCModuleFailed(err)))
        );
    })
  );

const getOrdersAllEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(OrdersAllActions.GET_ORDERS_ALL),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      ),
      state$.pipe(pluck('ordersReducer', 'ordersAllReducer', 'pageState'))
    ),
    switchMap(([action, productName, pageState]) => {
      const payload = action.payload.pageSize
        ? { ...action.payload }
        : { ...action.payload, ...pageState };

      return new SelectorUseCase.GetOrdersAllUseCase()
        .execute(payload, productName)
        .pipe(
          delayWhen(delayLoading),
          map((res) => getOrdersAllSuccess(res)),
          catchError((err) => of(getOrdersAllFailed(err)))
        );
    })
  );

const getOrdersSubmissionEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(OrderSubmissionActions.GET_ORDER_SUBMISSION),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      ),
      state$.pipe(pluck('ordersReducer', 'orderSubmissionReducer', 'pageState'))
    ),
    switchMap(([action, productName, pageState]) => {
      const payload = action.payload.pageSize
        ? {
            ...action.payload,
          }
        : { ...action.payload, ...pageState };

      return new SelectorUseCase.GetOrdersSubmissionUseCase()
        .execute(payload, productName)
        .pipe(
          delayWhen(delayLoading),
          map((res) => getOrderSubmissionSuccess(res)),
          catchError((err) => of(getOrderSubmissionFailed(err)))
        );
    })
  );

const getOrdersApprovalEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(OrdersApprovalActions.GET_ORDERS_APPROVAL),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      ),
      state$.pipe(pluck('ordersReducer', 'orderApprovalReducer', 'pageState'))
    ),
    switchMap(([action, productName, pageState]) => {
      const payload = action.payload.pageSize
        ? {
            ...action.payload,
          }
        : { ...action.payload, ...pageState };

      return new SelectorUseCase.GetOrdersSubmissionUseCase()
        .execute(payload, productName)
        .pipe(
          delayWhen(delayLoading),
          map((res) => getOrdersApprovalSuccess(res)),
          catchError((err) => of(getOrdersApprovalFailed(err)))
        );
    })
  );

export const updateDocumentStatusEpic: epicWithDependencies = (
  action$,
  state$,
  { apiServices: { OrderApi } }
) =>
  action$.pipe(
    ofType(OrderActionTypes.UPDATE_DOCUMENT_STATUS),
    withLatestFrom(state$.pipe(pluck('order', 'payload'))),
    switchMap(([action, state]) => {
      const orderApi = new OrderApi();
      return orderApi.updateDocumentStatus(state.name, action.payload).pipe(
        pluck('data'),
        switchMap((res) =>
          merge(
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.updateOrderSuccessfully'),
                status: CONSTANTS.snackBarConfig.type.success,
              })
            ),
            of(updateDocumentStatusSuccess(res))
          )
        ),
        catchError((error) =>
          of(
            updateDocumentStatusFailed(error.toString()),
            showSnackBar({
              isOpen: true,
              message: getString('text.errorMessage', {
                message: error.toString(),
              }),
              status: CONSTANTS.snackBarConfig.type.error,
            })
          )
        )
      );
    })
  );

export default combineEpics(
  fetchOrderEpic,
  updateCustomerEpic,
  uploadDocumentSelectorEpic,
  deleteDocumentEpic,
  updateOrderEpic,
  getUploadedDocumentsEpic,
  getOrdersAllEpic,
  getOrdersDocumentsEpic,
  getQCModuleEpic,
  getOrdersSubmissionEpic,
  createOrderCommentEpic,
  getCommentEpic,
  getCommentAfterCreateEpic,
  updateDocumentStatusEpic,
  getInsurersAllEpic,
  getOrdersApprovalEpic
);
