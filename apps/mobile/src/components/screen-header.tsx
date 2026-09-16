import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, typography } from '@/theme'

export function ScreenHeader({ title }: { title: string }) {
  const router = useRouter()
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
        <Text style={styles.back}>‹ Voltar</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  back: { color: colors.brand, fontSize: typography.body, fontWeight: '600', width: 80 },
  title: { fontSize: typography.subheading, fontWeight: '700', color: colors.text },
  spacer: { width: 80 },
})
