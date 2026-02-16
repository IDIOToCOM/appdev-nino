import React from 'react';
import { View } from 'react-native';

import AppNav from './src/navigation';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <AppNav />
    </View>
  );
};

export default App;