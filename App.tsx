import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNav from './src/navigation';
import PushNotificationBootstrap from './src/components/PushNotificationBootstrap';
import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import { setUnauthorizedHandler } from './src/app/api/client';
import { authLogout } from './src/app/action';
import { UTO } from './src/theme/uto';

const { store, persistor, runSaga } = configureStore();
runSaga(rootSaga);

setUnauthorizedHandler(() => {
  store.dispatch(authLogout());
});

/** Runs after Redux persist rehydration so auth state is ready. */
const AppContent = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), user => {
      const session = store.getState().auth.data;
      // Only clear JWT when a Firebase-bound session lost its Firebase user.
      if (!user && session?.uid) {
        store.dispatch(authLogout());
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <PushNotificationBootstrap />
      <AppNav />
    </>
  );
};

const App = () => {
  useEffect(() => {
    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate
            loading={
              <View style={styles.boot}>
                <ActivityIndicator size="large" color={UTO.navy} />
              </View>
            }
            persistor={persistor}
          >
            <AppContent />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UTO.background,
  },
});

export default App;
