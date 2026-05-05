import DateFnsUtils from '@date-io/date-fns';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import flagsmith from 'flagsmith';
import { FlagsmithProvider } from 'flagsmith/react';
import React, { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { OrderDetail } from 'mock-data/OrderDetail.mock';
import { qcAnswersMock } from 'mock-data/QcAnswers.mock';
import { QcContext } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/QcContext';
import { flagSmithEnv } from 'utils/env';

import i18n from './i18n-context';
import { setupApiStore } from './rtl-store';

import { apiSlice } from '../data/slices/apiSlice';
import { persistedReducer, store } from '../presentation/redux/store';
import maTheme from '../presentation/theme';

const customRender = (
  ui: ReactElement,
  {
    initialState,
    _store = configureStore({
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([apiSlice.middleware]) as any,
      reducer: persistedReducer,
      preloadedState: initialState,
    }),
    ...options
  }: any = {}
) => {
  function AllTheProviders({ children }: Readonly<{ children: JSX.Element }>) {
    return (
      <FlagsmithProvider
        options={{
          environmentID: flagSmithEnv,
          angularHttpClient: null,
        }}
        flagsmith={flagsmith}
      >
        <Provider store={_store}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <MuiThemeProvider theme={maTheme[0]}>
              <ThemeProvider theme={maTheme[0]}>
                <I18nextProvider i18n={i18n as any}>
                  <BrowserRouter>{children}</BrowserRouter>
                </I18nextProvider>
              </ThemeProvider>
            </MuiThemeProvider>
          </MuiPickersUtilsProvider>
        </Provider>
      </FlagsmithProvider>
    );
  }

  return render(ui, { wrapper: AllTheProviders, ...options });
};

function customRenderHook<T extends (props: any) => unknown>(
  hook: T,
  {
    initialState,
    _store = configureStore({
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([apiSlice.middleware]) as any,
      reducer: persistedReducer,
      preloadedState: initialState,
    }),
    ...options
  }: any = {}
) {
  function AllTheProviders({ children }: Readonly<{ children: JSX.Element }>) {
    return (
      <FlagsmithProvider
        options={{
          environmentID: flagSmithEnv,
          angularHttpClient: null,
        }}
        flagsmith={flagsmith}
      >
        <Provider store={_store}>
          <MuiThemeProvider theme={maTheme[0]}>
            <ThemeProvider theme={maTheme[0]}>
              <BrowserRouter>{children}</BrowserRouter>
            </ThemeProvider>
          </MuiThemeProvider>
        </Provider>
      </FlagsmithProvider>
    );
  }

  return {
    ...renderHook(hook, { wrapper: AllTheProviders, ...options }),
    store: _store,
  };
}

// use this provider component when component in test rely on both redux-observable and rtk-query for async logic!
const storeRef = setupApiStore(apiSlice);
export function ComponentWithProvider({
  children,
}: Readonly<{ children: JSX.Element }>) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

const sleep = (ms: number) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

export const renderWithContext = (
  ui: React.ReactElement,
  { providerProps, ...renderOptions }: any = {}
) =>
  customRender(
    <QcContext.Provider {...providerProps}>{ui}</QcContext.Provider>,
    renderOptions
  );

export const providerProps = {
  value: {
    state: {
      orderDetail: OrderDetail,
      answers: qcAnswersMock,
      countdown: {
        address: [],
      },
    },
    dispatch: () => null,
  },
};

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook, sleep };
