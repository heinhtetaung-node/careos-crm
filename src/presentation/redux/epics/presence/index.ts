import { ofType, combineEpics } from 'redux-observable';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, mergeAll, tap } from 'rxjs/operators';

import UpdatePresenceUseCase from 'domain/usecases/presence/UpdatePresenceUseCase';
import LocalStorage, { LOCALSTORAGE_KEY } from 'shared/helper/LocalStorage';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import { getString } from '../../../theme/localization';
import {
  logoutUserFailed,
  logoutUserSuccess,
  PresenceActionTypes,
  updatePresenceFailed,
  updatePresenceSuccess,
} from '../../actions/presence';
import { showSnackBar } from '../../actions/ui';
import { RabbitResource } from 'data/gateway/api/resource';
import { isEnableSSO } from 'app.helper';

const logoutUserEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(PresenceActionTypes.LOGOUT_USER),
    exhaustMap((action) =>
      new UpdatePresenceUseCase().execute(action.payload, action.userName).pipe(
        map(({ data }) => logoutUserSuccess(data)),
        tap(() => {
          const localStorage = new LocalStorage();
          localStorage.removeItemByKey(LOCALSTORAGE_KEY.USER_ID);
        }),
        catchError((error) => of(logoutUserFailed(error.toString())))
      )
    )
  );

const logoutUserSuccessEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(PresenceActionTypes.LOGOUT_USER_SUCCESS),
    map(() =>
      of(
        showSnackBar({
          isOpen: true,
          message: getString('text.logoutSuccess'),
          status: 'success',
        })
      )
    ),
    tap(() => {
      if (isEnableSSO) {
        const signOutUrl = `${process.env.VITE_API_ENDPOINT}/oauth2/sign_out`;
        window.location.href = signOutUrl;
      } else {
        window.location.replace(RabbitResource.Auth.getLogoutUrl());
      }
    }),
    mergeAll()
  );

const logoutUserFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(PresenceActionTypes.LOGOUT_USER_FAILED),
    map((err) =>
      of(
        showSnackBar({
          isOpen: true,
          message: getString('text.logoutFailed', {
            message: err.payload,
          }),
          status: 'error',
        })
      )
    ),
    mergeAll()
  );

const updatePresenceEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(PresenceActionTypes.UPDATE_PRESENCE),
    exhaustMap((action) =>
      new UpdatePresenceUseCase().execute(action.payload, action.userName).pipe(
        map(({ data }) => updatePresenceSuccess(data)),
        catchError((error) => of(updatePresenceFailed(error.toString())))
      )
    )
  );

const presenceEpic = combineEpics(
  logoutUserEpic,
  logoutUserSuccessEpic,
  logoutUserFailedEpic,
  updatePresenceEpic
);
export default presenceEpic;
