import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, BottomTabParamList } from '../types/navigation';
import { BrowseRoomsScreen } from '../screens/BrowseRoomsScreen';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS, SHADOWS } from '../constants/theme';
import { useBookingStore } from '../store/useBookingStore';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabNavigator: React.FC = () => {
  const activeReservations = useBookingStore((state) => state.activeReservations);
  const activeCount = activeReservations.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="BrowseRooms"
        component={BrowseRoomsScreen}
        options={{
          tabBarLabel: 'Tra Cứu Phòng',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Lịch Đặt',
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          tabBarBadgeStyle: styles.badgeStyle,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'ticket' : 'ticket-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Hồ Sơ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    ...SHADOWS.subtle,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeStyle: {
    backgroundColor: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
    minWidth: 16,
    height: 16,
  },
});
