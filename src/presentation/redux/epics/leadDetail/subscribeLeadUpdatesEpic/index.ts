import { isEmpty } from 'lodash';
import { ofType } from 'redux-observable';
import { EMPTY, merge, of } from 'rxjs';
import { catchError, mergeMap, pluck, switchMap } from 'rxjs/operators';

import { websocketEnabled } from 'config/feature-flags';
import WebSocketGateway from 'data/gateway/websocket';
import { getLeadSuccess } from 'presentation/redux/actions/leadDetail/getLeadByName';
import {
  LeadDetailUpdateLeadDataActionTypes,
  updateLeadFailed,
} from 'presentation/redux/actions/leadDetail/updateLeadData';
import { LeadDetailActionTypes } from 'presentation/redux/actions/leads/detail';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { epicWithoutStateFn } from 'shared/interfaces/common';
import { formatLead } from '../getLeadDataEpic/helper';

const subscribeLeadDataUpdatesEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES),
    switchMap((action) => {
      if (!websocketEnabled) return EMPTY;
      const leadName = action?.payload?.leadName;
      if (!leadName) return EMPTY;
      const pattern = `lead/v1alpha2/leads/${leadName}`;
      const _subscription = WebSocketGateway.getInstance().subscribe(pattern, {
        strictFiltering: true,
      });
      if (!_subscription) return EMPTY;
      return _subscription.pipe(
        pluck('body'),
        mergeMap((res: any) => {
          if (isEmpty(res)) {
            return EMPTY;
          }

          // Updated leads data
          return merge(
            of({
              type: LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA_SUCCESS,
              payload: {
                ...res,
                important: res.important ?? false,
              },
            }),
            of(getLeadSuccess(formatLead(res))),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.updatedInformation'),
                status: 'success',
              })
            )
          );
        }),
        catchError((error) => merge(of(updateLeadFailed(error))))
      );
    })
  );

export default subscribeLeadDataUpdatesEpic;
