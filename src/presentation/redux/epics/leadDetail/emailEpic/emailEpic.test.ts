import { StateObservable } from 'redux-observable';
import { of, Subject } from 'rxjs';
import { toArray } from 'rxjs/operators';

import MailerApi from 'data/gateway/api/services/mailer';
import { LeadActionTypes } from 'presentation/redux/actions/leadDetail/email';

import { getUnReadMailCountEpic } from '.';

const mockGetUnreadMailCount$ = of({ data: { count: 10 } });

jest.mock('data/gateway/api/services/mailer', () =>
  jest.fn().mockImplementation(() => ({
    getUnreadMailCount: jest.fn().mockReturnValue(mockGetUnreadMailCount$),
  }))
);

describe('getUnReadMailCountEpic', () => {
  const state$ = new StateObservable(new Subject(), {});

  it('should get un-read mails count successfully', async () => {
    const action$ = of({
      type: LeadActionTypes.GET_MAIL_READ_COUNT,
      payload: { orderLeadId: '123' },
    });

    const result$ = getUnReadMailCountEpic(action$, state$, {
      apiServices: {
        MailerApi,
      },
    }).pipe(
      toArray() // buffers output until Epic naturally completes()
    );

    const result = await result$.toPromise();

    expect(result).toEqual([
      {
        type: LeadActionTypes.GET_MAIL_READ_COUNT_SUCCESS,
        payload: { count: 10 },
      },
    ]);
  });
});
