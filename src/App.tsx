import { UIContext } from '@alphafounders/ui';
import { useNewRelic } from '@careos/newrelic';
import DateFnsUtils from '@date-io/date-fns';
import {
  ThemeProvider as MuiThemeProvider,
  StylesProvider,
} from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useAsyncEffect } from 'ahooks';
import i18n from 'i18next';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Helmet from 'react-helmet';
import { ThemeProvider } from 'styled-components';

import CallAudio from 'presentation/components/CallButtonV2/CallAudio';
import AudioTrack from 'presentation/components/LeadDetails/AudioTrack';
import SnackbarComponent from 'presentation/components/SnackBar';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';

import { initApplication } from './presentation/redux/actions/general/appInitiation';
import Routes from './presentation/routes/Routes';
import maTheme from './presentation/theme';
import {
  changeLanguage,
  getLanguage,
  setLanguageToStorage,
  initialLanguage,
} from './presentation/theme/localization';
import { initCareOsCall } from 'data/slices/callSlice';
import CareOsCall from 'careos-call';
import WebSocketGateway from 'data/gateway/websocket';
import { baseUrls } from 'data/slices/apiSlice';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import ErrorFallback from 'presentation/components/ErrorFallback';

function App() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.themeReducer);

  const featureFlags = useFlags([
    FeatureFlags.BROK_2550_ENABLE_CASEOS_CALL_ICE_SERVER_CONFIGURATION_FROM_BACKEND_API,
  ]);
  const isEnableCareOsCallIceServerConfig =
    featureFlags[
      FeatureFlags
        .BROK_2550_ENABLE_CASEOS_CALL_ICE_SERVER_CONFIGURATION_FROM_BACKEND_API
    ]?.enabled ?? false;

  useEffect(() => {
    dispatch(initApplication());

    dispatch(
      initCareOsCall(
        new CareOsCall({
          callServiceUrl: baseUrls.salesFlow,
          websocket: WebSocketGateway.getInstance().getWs() as any,
          shouldUseDefaultIceServers: !isEnableCareOsCallIceServerConfig,
        })
      )
    );
  }, [dispatch]);

  useAsyncEffect(async () => {
    initialLanguage();
    setLanguageToStorage();
    await changeLanguage(getLanguage());
  }, []);

  const { nrAgent } = useNewRelic();

  const logError = (error: Error, info: React.ErrorInfo) => {
    console.error(info.componentStack);
    nrAgent?.noticeError(error);
  };

  return (
    <>
      <Helmet titleTemplate="%s" defaultTitle="Rabbit Care" />
      <StylesProvider injectFirst>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <MuiThemeProvider theme={maTheme[theme.currentTheme]}>
            <ThemeProvider theme={maTheme[theme.currentTheme]}>
              <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onError={logError}
              >
                <UIContext i18nInstance={i18n as any}>
                  <SnackbarComponent />
                  <Routes />
                  <AudioTrack />
                  <CallAudio />
                </UIContext>
              </ErrorBoundary>
            </ThemeProvider>
          </MuiThemeProvider>
        </MuiPickersUtilsProvider>
      </StylesProvider>
    </>
  );
}

export default App;
