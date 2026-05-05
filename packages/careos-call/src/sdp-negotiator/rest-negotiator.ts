import { defer, firstValueFrom, from, of, throwError, timer } from 'rxjs';
import { concatMap, mergeMap, retryWhen } from 'rxjs/operators';

import Api from '../api/index';

const MAX_RETRY_ATTAMPTS = 4;
const POLL_INTERVAL = 2000;

export default class RestNegotiator {
  api: Api;

  constructor(api: Api) {
    this.api = api;
  }

  async sendOffer(callName: string, offer: string) {
    const res = await this.api.putOffer(callName, offer);
    if (!res.type) {
      throw Error('Sending offer fail');
    }
  }

  async startListeningForAnswer(callName: string) {
    // poll answer api 4 times with 2s interval
    const sub = defer(() => from(this.api.getAnswer(callName))).pipe(
      concatMap((source) => {
        if (!source.sdp) {
          throw Error('There is no sdp answer from the server');
        }
        return of(source);
      }),
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, i) => {
            const retryAttempt = i + 1;
            // if maximum number of retries have been met, throw error
            if (retryAttempt > MAX_RETRY_ATTAMPTS - 1) {
              return throwError(error);
            }
            // retry after poll interval
            return timer(POLL_INTERVAL);
          })
        )
      )
    );
    return firstValueFrom(sub);
  }
}
