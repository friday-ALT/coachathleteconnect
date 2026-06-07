import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const webUrl =
    process.env.WEB_URL ||
    process.env.EXPO_PUBLIC_WEB_URL ||
    'http://127.0.0.1:5000';

  return {
    ...config,
    name: config.name ?? 'CoachConnect',
    slug: config.slug ?? 'coachconnect',
    extra: {
      ...config.extra,
      webUrl,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID ?? config.extra?.googleWebClientId,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID ?? config.extra?.googleIosClientId,
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID ?? config.extra?.googleAndroidClientId,
    },
  } as ExpoConfig;
};
