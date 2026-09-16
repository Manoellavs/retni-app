import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { colors } from '@/theme'

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: focused ? colors.brand : colors.textMuted }}>
      {symbol}
    </Text>
  )
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions/index"
        options={{
          title: 'Transações',
          tabBarIcon: ({ focused }) => <TabIcon symbol="≡" focused={focused} />,
        }}
      />
      <Tabs.Screen name="transactions/new" options={{ href: null }} />
      <Tabs.Screen name="transactions/[id]" options={{ href: null }} />
    </Tabs>
  )
}
