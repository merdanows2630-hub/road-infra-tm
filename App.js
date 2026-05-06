// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import ReportScreen from './src/screens/ReportScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { COLORS } from './src/theme';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { t } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Map: focused ? 'map' : 'map-outline',
            Report: focused ? 'add-circle' : 'add-circle-outline',
            Statistics: focused ? 'bar-chart' : 'bar-chart-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          const iconName = icons[route.name] || 'ellipse-outline';
          return <Ionicons name={iconName} size={route.name === 'Report' ? 28 : 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home') }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: t('map') }} />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          title: t('report'),
          tabBarActiveTintColor: COLORS.accent,
        }}
      />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: t('statistics') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppTabs />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
