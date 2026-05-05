import { combineEpics, ofType } from 'redux-observable';
import { of } from 'rxjs';
import { catchError, pluck, map, switchMap } from 'rxjs/operators';

import SelectorUseCase from 'domain/usecases/provinceDetail';
import {
  GetProvinceActionTypes,
  getProvinceFailed,
  getProvinceSuccess,
} from 'presentation/redux/actions/provinceDetail';
import { epicWithoutStateFn, IAction } from 'shared/interfaces/common';

const getProvinceEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(GetProvinceActionTypes.GET_PROVINCE_DETAIL),
    switchMap((action: IAction<any>) =>
      new SelectorUseCase.GetProvinceUseCase(action.payload as any)
        .execute()
        .pipe(
          pluck('data'),
          map((res) => getProvinceSuccess(res)),
          catchError((error) => of(getProvinceFailed(error.toString())))
        )
    )
  );

export default combineEpics(getProvinceEpic);
