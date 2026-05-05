import { BrowserAgent } from '@newrelic/browser-agent/loaders/browser-agent';
import { JSErrors } from '@newrelic/browser-agent/features/jserrors';

import { mode } from './constant';

// Populate using values in copy-paste JavaScript snippet.
const options = {
  init: {
    distributed_tracing: { enabled: true },
    privacy: { cookies_enabled: true },
    ajax: { deny_list: ['bam.eu01.nr-data.net'] },
  }, // NREUM.init
  info: {
    beacon: 'bam.eu01.nr-data.net',
    errorBeacon: 'bam.eu01.nr-data.net',
    licenseKey: import.meta.env.VITE_NEW_RELIC_LICENSE_KEY,
    applicationID: import.meta.env.VITE_NEW_RELIC_APPLICATION_ID,
    sa: 1,
  }, // NREUM.info
  loader_config: {
    accountID: import.meta.env.VITE_NEW_RELIC_ACCOUNT_ID,
    trustKey: import.meta.env.VITE_NEW_RELIC_ACCOUNT_ID,
    agentID: import.meta.env.VITE_NEW_RELIC_APPLICATION_ID,
    licenseKey: import.meta.env.VITE_NEW_RELIC_LICENSE_KEY,
    applicationID: import.meta.env.VITE_NEW_RELIC_APPLICATION_ID,
  }, // NREUM.loader_config'
  features: [JSErrors],
};

function initNewRelic() {
  if (mode !== 'development') {
    // The agent loader code executes immediately on instantiation.
    // eslint-disable-next-line no-new
    return new BrowserAgent(options);
  }

  return null;
}

// eslint-disable-next-line import/prefer-default-export
export { initNewRelic };
