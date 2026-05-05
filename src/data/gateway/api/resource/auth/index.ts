const KRATOS_LOGIN = '/self-service/login/browser';
const KRATOS_SETTINGS = '/self-service/settings/browser';
const KRATOS_LOGOUT = '/public/self-service/browser/flows/logout';
const KRATOS_SETTINGS_REQUEST = '/self-service/settings/flows';

const baseKratosUrl = process.env.VITE_KRATOS_URL;
const recoveryLinkUrl = process.env.VITE_RECOVERY_URL;

const getLoginUrl = (): string => `${baseKratosUrl}${KRATOS_LOGIN}`;

const getSettingsUrl = (): string => `${baseKratosUrl}${KRATOS_SETTINGS}`;

const getLogoutUrl = (): string => `${baseKratosUrl}${KRATOS_LOGOUT}`;

const getSettingsMethodUrl = (flow: string): string =>
  `${baseKratosUrl}${KRATOS_SETTINGS_REQUEST}?id=${flow}`;

const getRecoveryLinkUrl = (user: string): string => {
  if (!recoveryLinkUrl) {
    throw new Error('Recovery Link URL not configured');
  }

  return recoveryLinkUrl.replace('{user}', user);
};

export default {
  getLoginUrl,
  getLogoutUrl,
  getSettingsUrl,
  getSettingsMethodUrl,
  getRecoveryLinkUrl,
};
