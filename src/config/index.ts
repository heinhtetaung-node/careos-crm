import { IRemoteConfig } from '../shared/interfaces/common';

let configs: IRemoteConfig | undefined;

export const initConfig = (): Promise<IRemoteConfig> => {
  return new Promise((resolve, reject) => {
    // Some data from remote config API place here
    const config: IRemoteConfig = {
      endpoint: process.env.VITE_API_ENDPOINT,
      gateway: process.env.VITE_GATEWAY_ENDPOINT,
    };
    configs = config;
    if (configs) {
      resolve(config);
    } else {
      reject();
    }
  });
};

export const getBaseConfig = (): IRemoteConfig | undefined => {
  return configs;
};
