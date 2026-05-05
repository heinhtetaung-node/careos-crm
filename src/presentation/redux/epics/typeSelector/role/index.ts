import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { IAction, epicWithoutStateFn } from 'shared/interfaces/common';
import { IGetRoleSelector } from 'shared/interfaces/common/typeSelector/role';

import SelectorUseCase from '../../../../../domain/usecases/typeSelector';
import {
  RoleSelectorActionTypes,
  getRoleSelectorTypesFail,
  getRoleSelectorTypesSuccess,
} from '../../../actions/typeSelector/role';

const getRoleSelectorTypesEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(RoleSelectorActionTypes.GET_ROLE_TYPES),
    switchMap((action: IAction<IGetRoleSelector>) =>
      new SelectorUseCase.GetRoleSelectorsUseCase(
        action.payload as IGetRoleSelector
      )
        .execute()
        .pipe(
          map((res) => getRoleSelectorTypesSuccess(res)),
          catchError((error) => of(getRoleSelectorTypesFail(error.toString())))
        )
    )
  );

export default getRoleSelectorTypesEpic;
