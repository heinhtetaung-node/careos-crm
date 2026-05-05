import { ofType } from 'redux-observable';
import { EMPTY, from, iif, of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap } from 'rxjs/operators';

import ChangeLanguageUseCase from 'domain/usecases/general/changeLanguage';
import {
  CHANGE_LANGUAGE,
  changeLanguageFailed,
  changeLanguageSuccess,
} from 'presentation/redux/actions/languages';
import { changeLanguage } from 'presentation/theme/localization';

import { epicWithoutStateFn } from '../../../../../shared/interfaces/common';

const changeLanguageEpic$: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(CHANGE_LANGUAGE),
    exhaustMap((action) => {
      const language = action.payload;
      const changeLanguageUseCase = new ChangeLanguageUseCase(language);
      return from(changeLanguage(language)).pipe(
        map(() => changeLanguageSuccess(language)),
        mergeMap(() =>
          from(changeLanguageUseCase.execute()).pipe(
            mergeMap((res: any) =>
              iif(() => res.data, of(changeLanguageSuccess(res.data)), EMPTY)
            )
          )
        ),
        catchError((error) => of(changeLanguageFailed(error.toString() || '')))
      );
    })
  );

export default changeLanguageEpic$;
