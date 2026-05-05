import { ofType } from 'redux-observable';
import { EMPTY, forkJoin, merge, of } from 'rxjs';
import { map, catchError, switchMap, mergeMap, pluck } from 'rxjs/operators';

import { websocketEnabled } from 'config/feature-flags';
import WebSocketGateway from 'data/gateway/websocket';
import LeadUseCase from 'domain/usecases/lead';
import { getLookUpUsersSuccess } from 'presentation/redux/actions/admin/user';
import {
  getCommentSuccess,
  getCommentFail,
  LeadActivityTypes,
} from 'presentation/redux/actions/leadActivity';
import {
  getCommentAfterCreateFail,
  getCommentAfterCreateSuccess,
  subscribeLeadCommentUpdatesSuccess,
} from 'presentation/redux/actions/leadActivity/comment';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { epicWithoutStateFn, epicWithStateFn } from 'shared/interfaces/common';

import { getCommentData } from './helper';

const getCommentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActivityTypes.GET_COMMENT),
    switchMap((action: any) =>
      forkJoin([
        new LeadUseCase.GetCommentUseCase().execute(action.payload.comments),
      ]).pipe(
        mergeMap((res: any) =>
          of(
            getLookUpUsersSuccess(action.payload.users),
            getCommentSuccess(
              getCommentData([
                { selectData: action.payload.users.data },
                res[0],
              ])
            )
          )
        ),
        catchError((error: any) => of(getCommentFail(error.toString())))
      )
    )
  );

const getCommentAfterCreateEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActivityTypes.GET_COMMENT_AFTER_CREATE),
    switchMap((action: any) =>
      forkJoin([
        new LeadUseCase.GetCommentUseCase().execute(action.payload.comments),
      ]).pipe(
        map((res: any) => getCommentAfterCreateSuccess(getCommentData(res))),
        catchError((error: any) =>
          of(getCommentAfterCreateFail(error.toString()))
        )
      )
    )
  );

const subscribeCommentUpdatesEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES),
    switchMap((action) => {
      if (!websocketEnabled) return EMPTY;
      const leadName = action?.payload?.leadName;
      if (!leadName) return EMPTY;
      const _subscription = WebSocketGateway.getInstance().subscribe(
        `lead/v1alpha2/leads/${leadName}/comments/*`
      );
      if (!_subscription) return EMPTY;
      return _subscription.pipe(
        pluck('body'),
        mergeMap((res: any) => {
          if (!res) return EMPTY;
          const agent = state$.value?.authReducer?.data?.user;
          const comment = { ...res };

          if (comment?.createBy === agent.name) {
            comment.name = `${agent.firstName} ${agent.lastName}`;
          } else {
            comment.name = '';
          }

          return merge(
            of(subscribeLeadCommentUpdatesSuccess(comment)),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.commentUpdated'),
                status: 'success',
              })
            )
          );
        }),
        catchError(() => EMPTY)
      );
    })
  );

export {
  getCommentEpic,
  getCommentAfterCreateEpic,
  subscribeCommentUpdatesEpic,
};
