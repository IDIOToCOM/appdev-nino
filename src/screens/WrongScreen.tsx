import React from 'react';
import { Text, View } from 'react-native';

const WrongScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'blue',
      }}
    >
      <Text style={{ fontSize: 40 }}>Error</Text>
    </View>
  );
};

export default WrongScreen;
