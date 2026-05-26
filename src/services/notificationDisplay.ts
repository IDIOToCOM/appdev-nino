import { PermissionsAndroid, Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

/** Must match Forge FCM payload and AndroidManifest default channel. */
export const NOTIFICATION_CHANNEL_ID = 'uto_mobility_alerts';

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  if (Platform.OS === 'ios') {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  return true;
}

export async function ensureNotificationChannel(): Promise<void> {
  if (__DEV__) {
    await notifee.deleteChannel(NOTIFICATION_CHANNEL_ID).catch(() => undefined);
  }

  await notifee.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: 'Booking & alerts',
    description: 'Booking confirmations, reminders, and account updates',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: [300, 500],
  });
}

function extractTitleBody(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): { title: string; body: string } {
  const title =
    remoteMessage.notification?.title ||
    (typeof remoteMessage.data?.title === 'string'
      ? remoteMessage.data.title
      : 'Uto Mobility');
  const body =
    remoteMessage.notification?.body ||
    (typeof remoteMessage.data?.body === 'string'
      ? remoteMessage.data.body
      : '');

  return { title, body };
}

async function postTrayNotification(options: {
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> {
  const allowed = await ensureNotificationPermission();
  if (!allowed) {
    if (__DEV__) {
      console.warn('[notif] POST_NOTIFICATIONS denied — enable in app settings');
    }
    return;
  }

  await ensureNotificationChannel();

  if (!options.body && !options.title) {
    return;
  }

  await notifee.displayNotification({
    title: options.title,
    body: options.body,
    data: options.data ?? {},
    android: {
      channelId: NOTIFICATION_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
      sound: 'default',
      vibrationPattern: [300, 500],
      smallIcon: 'ic_notification',
      autoCancel: true,
    },
  });
}

/** Shows a system-tray notification with sound and vibration. */
export async function displayLocalNotification(options: {
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> {
  try {
    await postTrayNotification(options);
    if (__DEV__) {
      console.log('[notif] tray posted:', options.title);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[notif] displayLocalNotification failed', error);
    }
  }
}

/** Shows a system-tray notification with sound (foreground + data-only background). */
export async function displayPushNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  try {
    const { title, body } = extractTitleBody(remoteMessage);
    await postTrayNotification({
      title,
      body,
      data: Object.fromEntries(
        Object.entries(remoteMessage.data ?? {}).map(([k, v]) => [
          k,
          String(v),
        ]),
      ),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[notif] displayPushNotification failed', error);
    }
  }
}
