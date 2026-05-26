/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import App from './App';
import { name as appName } from './app.json';
import { displayPushNotification } from './src/services/notificationDisplay';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  // Notification+data payloads are shown by the OS when the app is backgrounded.
  // Display via Notifee for data-only messages and as a fallback on emulators.
  if (!remoteMessage.notification) {
    await displayPushNotification(remoteMessage);
  }
});

AppRegistry.registerComponent(appName, () => App);
