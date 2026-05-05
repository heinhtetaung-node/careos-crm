export const environment = process.env.MODE ?? 'development';

export const isDevelopment = environment === 'development';

export const flagSmithEnv = process.env.VITE_FLAGSMITH_ENVIRONMENT_ID ?? 'test';

export const chatwootUrl = process.env.VITE_CHATWOOT_URL ?? '';
