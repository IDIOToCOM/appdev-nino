import { Platform } from 'react-native';

import { apiFetch } from './client';

export type DevicePlatform = 'android' | 'ios';

export async function registerDeviceToken(
  authToken: string,
  fcmToken: string,
): Promise<boolean> {
  try {
    await apiFetch<{ registered: boolean }>('/device-tokens', {
      method: 'POST',
      auth: true,
      token: authToken,
      body: {
        fcmToken,
        platform: Platform.OS as DevicePlatform,
      },
    });
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('404')) {
      if (__DEV__) {
        console.log(
          '[push] POST /device-tokens not on server yet — see docs/BACKEND_FCM_PUSH.md',
        );
      }
      return false;
    }
    if (__DEV__) {
      console.warn('[push] registerDeviceToken failed', message);
    }
    return false;
  }
}

export async function unregisterDeviceToken(
  authToken: string,
  fcmToken: string,
): Promise<void> {
  try {
    await apiFetch<{ removed: boolean }>('/device-tokens', {
      method: 'DELETE',
      auth: true,
      token: authToken,
      body: { fcmToken },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (__DEV__ && !message.includes('404')) {
      console.warn('[push] unregisterDeviceToken failed', message);
    }
  }
}
