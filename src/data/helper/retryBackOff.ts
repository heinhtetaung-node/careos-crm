import { defer, iif, Observable, throwError, timer } from 'rxjs';
import { concatMap, retryWhen, tap } from 'rxjs/operators';

export function getDelay(backoffDelay: number, maxInterval: number) {
  return Math.min(backoffDelay, maxInterval);
}

export function exponentialBackoffDelay(
  iteration: number,
  initialInterval: number
) {
  return 2 ** iteration * initialInterval;
}

export interface RetryBackoffConfig {
  initialInterval: number;
  maxRetries?: number;
  maxInterval?: number;
  resetOnSuccess?: boolean;
  shouldRetry?: (error: any) => boolean;
  backoffDelay?: (iteration: number, initialInterval: number) => number;
}
// INFO: idea from https://github.com/alex-okrushko/backoff-rxjs/blob/master/src/operators/retryBackoff.ts
export function retryBackoff(
  config: number | RetryBackoffConfig
): <T>(source: Observable<T>) => Observable<T> {
  const {
    initialInterval,
    maxRetries = Infinity,
    maxInterval = Infinity,
    shouldRetry = () => true,
    resetOnSuccess = false,
    backoffDelay = exponentialBackoffDelay,
  } = typeof config === 'number' ? { initialInterval: config } : config;
  return <T>(source: Observable<T>) =>
    defer(() => {
      let index = 0;
      return source.pipe(
        retryWhen<T>((errors) =>
          errors.pipe(
            concatMap((error) => {
              index += 1;
              const attempt = index;
              newrelic?.noticeError?.(error);
              return iif(
                () => attempt < maxRetries && shouldRetry(error),
                timer(
                  getDelay(backoffDelay(attempt, initialInterval), maxInterval)
                ),
                throwError(error)
              );
            })
          )
        ),
        tap(() => {
          if (resetOnSuccess) {
            index = 0;
          }
        })
      );
    });
}
