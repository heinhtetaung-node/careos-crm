import { ofType } from 'redux-observable';
import { Observable } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

import InitAppUseCase from '../../../../../domain/usecases/general/appInitiation';
import {
  INIT_APP,
  initApplicationSuccess,
  initApplicationFailed,
} from '../../../actions/general/appInitiation';

const initAppEpic = (action$: any): any =>
  action$.pipe(
    ofType(INIT_APP),
    exhaustMap(
      () =>
        new Observable((obs) => {
          const usecase = new InitAppUseCase();
          usecase
            .execute()
            .then(() => {
              obs.next(initApplicationSuccess());
              obs.complete();
            })
            .catch((error) => {
              obs.next(initApplicationFailed(error.toString()));
              obs.complete();
            });
        })
    )
  );

export default initAppEpic;
