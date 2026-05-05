import { ofType, combineEpics } from 'redux-observable';
import { merge, of } from 'rxjs';
import {
  catchError,
  delayWhen,
  map,
  pluck,
  switchMap,
  withLatestFrom,
  mergeMap,
} from 'rxjs/operators';

import LookUpUserUsecase from 'domain/usecases/admin/user/lookUpUserUseCase';
import GetImportedPackageHistoryUseCase from 'domain/usecases/package/imported/GetImportedPackageHistory';
import { getLookUpUsersSuccess } from 'presentation/redux/actions/admin/user';
import { epicWithStateFn } from 'shared/interfaces/common';

import destroyWhen, {
  customForkJoin,
  delayLoading,
  delayLoadingForkJoin,
} from '../../../../shared/helper/operator';
import {
  PackageImportAction,
  getPackageImportSuccess,
  getPackageImportFail,
} from '../../actions/package';
import { PageActionTypes } from '../../actions/page';

const getImportedPackageHistoryEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(PackageImportAction.GET_PACKAGE_IMPORT),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      ),
      state$.pipe(pluck('packageReducer', 'listReducer', 'pageState')),
      state$.pipe(pluck('userReducer', 'lookUpUserReducer'))
    ),
    switchMap(([action, productName, pageState, userState]) => {
      if (userState?.data?.length) {
        const payload = action.payload.pageSize
          ? {
              ...action.payload,
            }
          : { ...action.payload, ...pageState };

        return new GetImportedPackageHistoryUseCase()
          .execute(payload, productName)
          .pipe(
            delayWhen(delayLoading),
            map((res: any) => {
              const importPackageList = res?.imports;
              return getPackageImportSuccess({
                importList: importPackageList,
                pageToken: res?.nextPageToken || '',
                currentPage: action.payload.currentPage,
                userList: userState.data,
              });
            }),
            catchError((err) => of(getPackageImportFail(err))),
            destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
          );
      }
      return customForkJoin(
        new GetImportedPackageHistoryUseCase().execute(
          action.payload,
          productName
        ),
        new LookUpUserUsecase().execute()
      ).pipe(
        delayWhen(delayLoadingForkJoin),
        mergeMap(([importList, userList]) => {
          const importPackageList = importList?.imports;
          const lookUpUsers = userList?.selectData;
          return merge(
            of(
              getPackageImportSuccess({
                importList: importPackageList || [],
                pageToken: importList.nextPageToken || '',
                currentPage: action.payload.currentPage,
                userList: lookUpUsers || [],
              })
            ),
            of(getLookUpUsersSuccess(userList))
          );
        }),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
      );
    })
  );

const packageEpic = combineEpics(getImportedPackageHistoryEpic);
export default packageEpic;
