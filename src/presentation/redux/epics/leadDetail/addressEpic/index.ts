import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { switchMap, mergeMap, catchError, pluck } from 'rxjs/operators';

import LeadDetailUseCase from 'domain/usecases/leadDetail';
import {
  addAddressFail,
  addAddressSuccess,
  LeadAddressActionTypes,
} from 'presentation/redux/actions/leadDetail/addressModal';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { epicWithoutStateFn } from 'shared/interfaces/common';

const addAddressToLeadsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadAddressActionTypes.ADD_ADDRESS),
    switchMap((action: any) =>
      new LeadDetailUseCase.AddAddressToLeadsUseCase()
        .execute(action.payload)
        .pipe(
          mergeMap((res: any[]) => {
            let message = '';
            let error;
            res.forEach((r) => {
              if (r.failed) {
                message += r.error._message.toString();
                error = r.error;
              }
            });

            if (message === '') {
              return of(
                addAddressSuccess(res[0].value),
                showSnackBar({
                  isOpen: true,
                  message: getString('text.addAddressSuccessful'),
                  status: 'success',
                })
              );
            }
            return of(
              addAddressFail(error),
              showSnackBar({
                isOpen: true,
                message,
                status: 'error',
              })
            );
          }),
          catchError((error) =>
            of(
              addAddressFail(error),
              showSnackBar({
                isOpen: true,
                message: error._message.toString(),
                status: 'error',
              })
            )
          )
        )
    )
  );

export default addAddressToLeadsEpic;
