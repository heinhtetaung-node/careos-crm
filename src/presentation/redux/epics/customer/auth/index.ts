import { ofType } from 'redux-observable';
import { Observable } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

import {
  IAction,
  epicWithoutStateFn,
} from '../../../../../shared/interfaces/common';
import {
  LOGIN_USER,
  loginUserSuccess,
  ILoginPayload,
} from '../../../actions/customer/auth';

export const loginCustomerEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LOGIN_USER),
    exhaustMap(
      (action: IAction<ILoginPayload>) =>
        new Observable((obs) => {
          const { payload }: any = action;
          // const { email, password } = payload!;
          obs.next(loginUserSuccess(payload));
          obs.complete();
        })
    )
  );

export const logoutCustomerEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LOGIN_USER),
    exhaustMap(
      (action: IAction<ILoginPayload>) =>
        new Observable((obs) => {
          const { payload }: any = action;
          // const { email, password } = payload!;
          obs.next(loginUserSuccess(payload));
          obs.complete();
        })
    )
  );
