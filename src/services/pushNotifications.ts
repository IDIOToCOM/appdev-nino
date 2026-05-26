import { Platform } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  getInitialNotification,
} from '@react-native-firebase/messaging';

import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '../app/api/deviceTokens';
import {
  displayPushNotification,
  ensureNotificationChannel,
  ensureNotificationPermission,
} from './notificationDisplay';

let cachedFcmToken: string | null = null;
let unsubscribeForeground: (() => void) | null = null;
let unsubscribeOpened: (() => void) | null = null;
let unsubscribeTokenRefresh: (() => void) | null = null;

export async function requestPushPermission(): Promise<boolean> {
  const androidOk = await ensureNotificationPermission();
  if (!androidOk) {
    return false;
  }

  if (Platform.OS !== 'ios') {
    return true;
  }

  const messaging = getMessaging();
  const status = await requestPermission(messaging);
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
}

export async function obtainFcmToken(): Promise<string | null> {
  const allowed = await requestPushPermission();
  if (!allowed) {
    return null;
  }

  try {
    const messaging = getMessaging();
    const token = await getToken(messaging);
    cachedFcmToken = token || null;
    return cachedFcmToken;
  } catch (error) {
    if (__DEV__) {
      console.warn('[push] getToken failed', error);
    }
    return null;
  }
}

export async function syncPushTokenWithServer(
  authToken: string | null,
): Promise<void> {
  if (!authToken) {
    return;
  }

  const fcmToken = cachedFcmToken ?? (await obtainFcmToken());
  if (!fcmToken) {
    return;
  }

  await registerDeviceToken(authToken, fcmToken);
}

export async function clearPushTokenFromServer(
  authToken: string | null,
): Promise<void> {
  if (!authToken || !cachedFcmToken) {
    return;
  }

  await unregisterDeviceToken(authToken, cachedFcmToken);
}

export function startPushListeners(options: {
  onRefreshNotifications: () => void;
  onTokenRefresh?: () => void;
}): () => void {
  stopPushListeners();

  void ensureNotificationChannel();

  const messaging = getMessaging();

  unsubscribeForeground = onMessage(messaging, remoteMessage => {
    options.onRefreshNotifications();
    void displayPushNotification(remoteMessage);
  });

  unsubscribeOpened = onNotificationOpenedApp(messaging, () => {
    options.onRefreshNotifications();
  });

  unsubscribeTokenRefresh = onTokenRefresh(messaging, async newToken => {
    cachedFcmToken = newToken;
    options.onTokenRefresh?.();
  });

  getInitialNotification(messaging).then(initial => {
    if (initial) {
      options.onRefreshNotifications();
    }
  });

  return stopPushListeners;
}

export function stopPushListeners(): void {
  unsubscribeForeground?.();
  unsubscribeForeground = null;
  unsubscribeOpened?.();
  unsubscribeOpened = null;
  unsubscribeTokenRefresh?.();
  unsubscribeTokenRefresh = null;
}
