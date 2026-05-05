import { ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

import {
  getLeadSuccess,
  getLeadFail,
  LeadDetailGetLeadActionTypes,
} from 'presentation/redux/actions/leadDetail/getLeadByName';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';
import { formatLead } from './helper';

const getAgentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailGetLeadActionTypes.GET_LEAD),
    switchMap((action) => {
      // TODO This needs to be refactored. Getting the lead ID from path is no longer sufficient
      // since the lead is being requested from everywhere.
      const newPayload = {
        leadId: getLeadIdFromPath(),
        ...action.payload,
      };
      return new LeadDetailUseCase.GetAgentUseCase()
        .execute(newPayload.leadId)
        .pipe(
          map((res) => {
            const resp = getLeadSuccess(res);
            return {
              ...resp,
              payload: formatLead(resp.payload),
            };
          }),
          catchError((error) => merge(of(getLeadFail(error))))
        );
    })
  );

export default getAgentEpic;
