import { combineEpics, ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { catchError, exhaustMap, mergeMap, pluck } from 'rxjs/operators';

import { getCommentAfterCreate } from 'presentation/redux/actions/leadActivity/comment';
import {
  LeadActionTypes,
  pushCommentFail,
  pushCommentSuccess,
} from 'presentation/redux/actions/leadDetail/comment';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import getCommentName from './commentEpicHelper';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';

const pushCommentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActionTypes.PUSH_COMMENT),
    exhaustMap((action: any) =>
      new LeadDetailUseCase.PushCommentUseCase().execute(action.payload).pipe(
        pluck('data'),
        mergeMap((res) =>
          merge(
            of(pushCommentSuccess(res)),
            of(
              getCommentAfterCreate({
                users: { pageSize: 200 },
                comments: {
                  params: { pageSize: 5, pageIndex: 1 },
                  name: getCommentName,
                },
              })
            ),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.pushCommentSuccess'),
                status: 'success',
              })
            )
          )
        ),
        catchError((error) =>
          merge(
            of(pushCommentFail(error)),
            of(
              showSnackBar({
                isOpen: true,
                message: error._message,
                status: 'error',
              })
            )
          )
        )
      )
    )
  );

const leadDetailCommentEpic = combineEpics(pushCommentEpic);

export default leadDetailCommentEpic;
