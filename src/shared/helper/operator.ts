import { Action } from 'redux';
import { ofType } from 'redux-observable';
import { EMPTY, forkJoin, from, iif, Observable, of, timer } from 'rxjs';
import {
  catchError,
  expand,
  max,
  pluck,
  reduce,
  takeUntil,
  tap,
} from 'rxjs/operators';

import * as CONSTANTS from 'shared/constants';

export const destroyWhen = (
  action$: Observable<Action>,
  actionName: string[]
) => takeUntil(action$.pipe(ofType(actionName[0], ...actionName.slice(1))));

export const delayLoading = ({ responseTimes }: any) => {
  const delayTimes =
    responseTimes < CONSTANTS.DELAY_DATA_TABLE_LOADING
      ? CONSTANTS.DELAY_DATA_TABLE_LOADING - responseTimes
      : 0;
  return timer(delayTimes);
};

export const delayLoadingForkJoin = (responseList: any[]) => {
  let maxTime = 0;
  from(responseList)
    .pipe(
      max((timeMin, timeMax) =>
        timeMin.responseTimes < timeMax.responseTimes ? -1 : 1
      ),
      pluck('responseTimes'),
      tap((res) => {
        maxTime = res;
      })
    )
    .subscribe();

  const delayTimes =
    maxTime < CONSTANTS.DELAY_DATA_TABLE_LOADING
      ? CONSTANTS.DELAY_DATA_TABLE_LOADING - maxTime
      : 0;

  return timer(delayTimes);
};

export const customForkJoin = (...rest: Observable<any>[]) => {
  const listRequest = rest.map((item: Observable<any>) =>
    item.pipe(catchError((error) => of(error)))
  );

  return forkJoin(listRequest);
};

export const recursiveApi = <T, U>(
  input: any,
  payload: Record<string, string | number | boolean>,
  pluckKey: string[],
  breakCondition: string
): Observable<U[]> =>
  input(payload).pipe(
    expand((response: any) =>
      iif(
        () => response[breakCondition],
        input({
          ...payload,
          pageToken: response[breakCondition],
        }),
        EMPTY
      )
    ),
    pluck(...pluckKey),
    reduce(
      (accumulator, currentValue: any) => accumulator.concat(currentValue),
      []
    )
  ) as Observable<U[]>;

export default destroyWhen;
