import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchBookings, fetchNotifications } from '../app/action';
import type { RootState } from '../app/reducers';
import { ensureNotificationChannel } from '../services/notificationDisplay';
import {
  startPushListeners,
  stopPushListeners,
  syncPushTokenWithServer,
  requestPushPermission,
} from '../services/pushNotifications';

/** Registers FCM token with Forge and refreshes in-app notifications on push. */
const PushNotificationBootstrap = () => {
  const dispatch = useDispatch<any>();
  const authToken = useSelector((s: RootState) => s.auth.data?.token);

  useEffect(() => {
    void ensureNotificationChannel();
    void requestPushPermission();
  }, []);

  useEffect(() => {
    if (!authToken) {
      stopPushListeners();
      return;
    }

    syncPushTokenWithServer(authToken);

    dispatch(fetchBookings());

    const stopListeners = startPushListeners({
      onRefreshNotifications: () => dispatch(fetchNotifications()),
      onTokenRefresh: () => syncPushTokenWithServer(authToken),
    });

    const poll = setInterval(() => {
      dispatch(fetchNotifications());
      dispatch(fetchBookings());
    }, 45_000);

    return () => {
      clearInterval(poll);
      stopListeners();
    };
  }, [authToken, dispatch]);

  return null;
};

export default PushNotificationBootstrap;
