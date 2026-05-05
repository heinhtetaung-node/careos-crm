/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
import {
  UnknownAction,
  combineReducers,
  configureStore,
  EnhancedStore,
  Middleware,
  Reducer,
} from '@reduxjs/toolkit';
import { act } from 'react-dom/test-utils';

export const ANY = 0 as any;

export const DEFAULT_DELAY_MS = 150;

function setupApiStore<
  A extends {
    reducer: Reducer<any, any>;
    reducerPath: string;
    middleware: Middleware;
    util: { resetApiState(): any };
  },
  R extends Record<string, Reducer<any, any>> = Record<never, never>,
>(api: A, extraReducers?: R): { api: any; store: EnhancedStore } {
  /*
   * Modified version of RTK Query's helper function:
   * https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/src/query/tests/helpers.tsx
   */
  const getStore = (): EnhancedStore =>
    configureStore({
      reducer: combineReducers({
        [api.reducerPath]: api.reducer,
        ...extraReducers,
      }),
      middleware: (gdm) =>
        gdm({ serializableCheck: false, immutableCheck: false }).concat(
          api.middleware
        ),
    });

  type StoreType = EnhancedStore<
    {
      api: ReturnType<A['reducer']>;
    } & {
      [K in keyof R]: ReturnType<R[K]>;
    },
    UnknownAction,
    ReturnType<typeof getStore> extends EnhancedStore<any, any, infer M>
      ? M
      : never
  >;

  const initialStore = getStore() as StoreType;
  const refObj = {
    api,
    store: initialStore,
  };
  const store = getStore() as StoreType;
  refObj.store = store;

  return refObj;
}

async function waitMs(time = DEFAULT_DELAY_MS) {
  const now = Date.now();
  while (Date.now() < now + time) {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((res) => process.nextTick(res));
  }
}

const hookWaitFor = async (cb: () => void, time = 2000) => {
  const startedAt = Date.now();

  while (true) {
    try {
      cb();
      return true;
    } catch (e) {
      if (Date.now() > startedAt + time) {
        throw e;
      }
      await act(() => waitMs(2));
    }
  }
};

export { setupApiStore, hookWaitFor };
