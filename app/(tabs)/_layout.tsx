import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRepInbox } from '../../hooks/useMessages';

function TabIcon({ name, focused, badge }: { name: any; focused: boolean; badge?: number }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconActive]}>
      <Ionicons name={name} size={22} color={focused ? Colors.white : Colors.textMuted} />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { profile } = useAuth();
  const { unreadCount } = useRepInbox(profile?.id);
  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="log"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="add-circle" focused={focused} /> }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="trophy" focused={focused} /> }}
      />
      <Tabs.Screen
        name="kpis"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" focused={focused} /> }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon name="shield-checkmark" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} badge={!isAdmin ? unreadCount : undefined} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: Colors.green,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.coral,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});
