import { isEmpty } from 'lodash';
import { ofType } from 'redux-observable';
import { EMPTY, of } from 'rxjs';
import { catchError, mergeMap, pluck, switchMap } from 'rxjs/operators';

import { websocketEnabled } from 'config/feature-flags';
import WebSocketGateway from 'data/gateway/websocket';
import { LeadActivityTypes } from 'presentation/redux/actions/leadActivity';
import {
  getMailReadCount,
  mailReadCountIncrement,
  mailReadCountDecrement,
} from 'presentation/redux/actions/leadDetail/email';
import { epicWithoutStateFn } from 'shared/interfaces/common';

const subscribeMailUpdatesEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES),
    switchMap((action) => {
      if (!websocketEnabled) return EMPTY;
      const leadId = action?.payload?.leadName;
      const { isApiCallForUnreadMailCountDisabled } = action.payload;
      if (!leadId) return EMPTY;
      const _subscription = WebSocketGateway.getInstance().subscribe(
        `mailer/v1alpha1/leads/${leadId}/mails/*`
      );
      if (!_subscription) return EMPTY;
      return _subscription.pipe(
        pluck('body'),
        mergeMap((res: any) => {
          if (isEmpty(res) || res?.type !== 'INBOUND') return EMPTY;
          if (isApiCallForUnreadMailCountDisabled) {
            if (res?.read) {
              return of(mailReadCountDecrement());
            }
            return of(mailReadCountIncrement());
          }
          return of(getMailReadCount());
        }),
        catchError(() => EMPTY)
      );
    })
  );

export default subscribeMailUpdatesEpic;
