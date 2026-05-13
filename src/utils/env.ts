export const environment = process.env.MODE ?? 'development';

export const isDevelopment = environment === 'development';

export const flagSmithEnv = process.env.VITE_FLAGSMITH_ENVIRONMENT_ID ?? 'test';
