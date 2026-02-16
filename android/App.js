import React from 'react';
import {View} from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const App = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <HomeScreen/>
            <ProfileScreen/>
        </View>
    );
};

export default App;