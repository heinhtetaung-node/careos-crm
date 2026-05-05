import { getBaseConfig } from '../../config';

const getConfig = (): any => {
  const mBaseConfig = getBaseConfig();
  if (mBaseConfig) {
    return mBaseConfig;
  }
  return {};
};

export default getConfig;
