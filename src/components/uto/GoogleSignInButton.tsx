import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID, isGoogleSignInConfigured } from '../../config/google';
import { UTO } from '../../theme/uto';

type Props = {
  onIdToken: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const GoogleSignInButton = ({ onIdToken, onError, disabled }: Props) => {
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (!isGoogleSignInConfigured()) {
      onError?.(
        'Google Sign-In is not configured. Check src/config/google.ts (Firebase web client ID).',
      );
      return;
    }

    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (result.type !== 'success') {
        return;
      }

      // Use the fresh token from this sign-in; getTokens() can return a stale cached id token.
      const idToken = result.data.idToken;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        if (!tokens.idToken) {
          onError?.('Google did not return a sign-in token. Try again.');
          return;
        }
        onIdToken(tokens.idToken);
        return;
      }
      onIdToken(idToken);
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          return;
        }
        if (error.code === statusCodes.IN_PROGRESS) {
          return;
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          onError?.('Google Play Services is not available on this device.');
          return;
        }
      }
      onError?.(
        error instanceof Error ? error.message : 'Google sign-in failed.',
      );
    } finally {
      setLoading(false);
    }
  }, [onError, onIdToken]);

  return (
    <Pressable
      style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
    >
      {loading ? (
        <ActivityIndicator color={UTO.navy} />
      ) : (
        <View style={styles.row}>
          <Text style={styles.label}>SIGN IN WITH GOOGLE</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: UTO.border,
    borderRadius: 12,
    backgroundColor: UTO.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: UTO.text,
  },
});

export default GoogleSignInButton;
