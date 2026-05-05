import { combineEpics, ofType } from 'redux-observable';
import { of } from 'rxjs';
import { catchError, pluck, map, switchMap } from 'rxjs/operators';

import SelectorUseCase from 'domain/usecases/carDetail';
import {
  GetCarDetailActionTypes,
  getCarDetailFailed,
  getCarDetailSuccess,
} from 'presentation/redux/actions/carDetail';
import { epicWithoutStateFn, IAction } from 'shared/interfaces/common';

const getCarDetailEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(GetCarDetailActionTypes.GET_CAR_DETAIL),
    switchMap((action: IAction<any>) =>
      new SelectorUseCase.GetCarDetailUseCase(action.payload as any)
        .execute()
        .pipe(
          pluck('data'),
          map((res) => getCarDetailSuccess(res)),
          catchError((error) => of(getCarDetailFailed(error.toString())))
        )
    )
  );

export default combineEpics(getCarDetailEpic);
