import 'regenerator-runtime/runtime';
import { NewRelicProvider } from '@careos/newrelic';
import flagsmith from 'flagsmith';
import { FlagsmithProvider } from 'flagsmith/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { initNewRelic } from './config/newrelic';
import App from './App';

import { store } from 'presentation/redux/store';
import { flagSmithEnv } from 'utils/env';

import 'react-quill/dist/quill.bubble.css';
import '@alphafounders/ui/index.css';
import 'scss/index.scss';
import './index.css';
import LivekitRoomProvider from 'presentation/components/CallButtonLiveKit/LivekitRoomProvider';

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const _newrelic = initNewRelic();

root.render(
  <NewRelicProvider newrelic={_newrelic}>
    <FlagsmithProvider
      options={{
        environmentID: flagSmithEnv,
        cacheFlags: true,
      }}
      flagsmith={flagsmith}
    >
      <Provider store={store}>
        <LivekitRoomProvider>
          <App />
        </LivekitRoomProvider>
      </Provider>
    </FlagsmithProvider>
  </NewRelicProvider>
);
