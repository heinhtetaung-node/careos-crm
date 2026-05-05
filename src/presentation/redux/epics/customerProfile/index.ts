import { ofType, combineEpics } from 'redux-observable';
import { merge, of, forkJoin } from 'rxjs';
import {
  catchError,
  delayWhen,
  pluck,
  switchMap,
  mergeMap,
  withLatestFrom,
} from 'rxjs/operators';

import { getLookUpUsersSuccess } from 'presentation/redux/actions/admin/user';
import destroyWhen, { delayLoadingForkJoin } from 'shared/helper/operator';
import { epicWithDependencies } from 'shared/interfaces/common';

import {
  CustomerProfileImportAction,
  getCustomerProfileImportSuccess,
  getCustomerProfileImportFail,
} from '../../actions/customerProfile';
import { PageActionTypes } from '../../actions/page';

const getCustomerProfileImportHistoryEpic: epicWithDependencies = (
  action$,
  state$,
  { apiServices: { ImportApi, BffLookupApi } }
) =>
  action$.pipe(
    ofType(CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      )
    ),
    switchMap(([action, productName]) => {
      const importApi = new ImportApi();
      const bffLookupApi = new BffLookupApi();

      const { pageSize, pageToken, orderBy } = action.payload;

      return forkJoin([
        importApi
          .getImportHistory(
            productName,
            'CUSTOMER',
            pageSize,
            pageToken,
            orderBy
          )
          .pipe(pluck('data')),
        bffLookupApi.getAllUsers().pipe(pluck('data')),
      ]).pipe(
        delayWhen(delayLoadingForkJoin),
        mergeMap(([importList, userList]) => {
          const importPackageList = importList?.imports;
          const lookUpUsers = userList?.selectData;
          return merge(
            of(
              getCustomerProfileImportSuccess({
                importList: importPackageList || [],
                pageToken: importList.nextPageToken || '',
                currentPage: action.payload.currentPage,
                userList: lookUpUsers || [],
              })
            ),
            of(getLookUpUsersSuccess(userList))
          );
        }),
        catchError((error) =>
          of(getCustomerProfileImportFail(error.message || ''))
        ),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
      );
    })
  );

const customerProfileEpic = combineEpics(getCustomerProfileImportHistoryEpic);
export default customerProfileEpic;
