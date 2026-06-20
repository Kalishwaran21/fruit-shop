import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import BillingScreen   from './src/screens/BillingScreen';
import MenuScreen      from './src/screens/MenuScreen';
import StockScreen     from './src/screens/StockScreen';
import LevelsScreen    from './src/screens/LevelsScreen';
import WastageScreen   from './src/screens/WastageScreen';
import LoginScreen     from './src/screens/LoginScreen';
import { COLORS }      from './src/styles';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#021408" />
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#021408" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: 'rgba(2,20,8,0.97)',
              borderTopColor: 'rgba(52,211,153,0.2)',
              borderTopWidth: 1,
              height: 68,
              paddingBottom: 10,
              paddingTop: 6,
            },
            tabBarActiveTintColor:   COLORS.primary,
            tabBarInactiveTintColor: 'rgba(134,239,172,0.45)',
            tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
            headerStyle: {
              backgroundColor: '#021408',
              borderBottomColor: 'rgba(52,211,153,0.2)',
              borderBottomWidth: 1,
            },
            headerTintColor: COLORS.primary,
            headerTitleStyle: { fontWeight: '800', fontSize: 16 }
          }}
        >
          <Tab.Screen
            name="Dashboard" component={DashboardScreen}
            options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />, headerTitle: '🌿 FreshFruits Pro' }}
          />
          <Tab.Screen
            name="Billing" component={BillingScreen}
            options={{ title: 'Bill', tabBarIcon: ({ focused }) => <TabIcon emoji="🧾" focused={focused} />, headerTitle: '🧾 New Invoice' }}
          />
          <Tab.Screen
            name="Menu" component={MenuScreen}
            options={{ title: 'Menu', tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />, headerTitle: '📋 Fruit Catalog' }}
          />
          <Tab.Screen
            name="Stock" component={StockScreen}
            options={{ title: 'Stock', tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} />, headerTitle: '📦 Stock Inward' }}
          />
          <Tab.Screen
            name="Levels" component={LevelsScreen}
            options={{ title: 'Levels', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, headerTitle: '📊 Live Stock' }}
          />
          <Tab.Screen
            name="Wastage" component={WastageScreen}
            options={{ title: 'Waste', tabBarIcon: ({ focused }) => <TabIcon emoji="🗑️" focused={focused} />, headerTitle: '🗑️ Wastage' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
