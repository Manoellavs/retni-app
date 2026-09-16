import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/auth-context";
import { uploadAttachment } from "@/services/storage";
import {
  categoryLabels,
  suggestCategory,
  transactionTypeLabels,
  type Transaction,
  type TransactionCategory,
  type TransactionInput,
  type TransactionType,
} from "@/domain/transaction";
import { colors, radius, spacing, typography } from "@/theme";

interface PendingAttachment {
  uri: string;
  name: string;
}

export function TransactionForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Transaction;
  submitLabel: string;
  onSubmit: (input: TransactionInput) => Promise<void>;
}) {
  const { user } = useAuth();

  const [type, setType] = useState<TransactionType>(
    initial?.type ?? "pagamento",
  );
  const [category, setCategory] = useState<TransactionCategory>(
    initial?.category ?? "outros",
  );
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  );

  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(
    initial?.attachmentUrl ?? null,
  );
  const [attachmentName, setAttachmentName] = useState<string | null>(
    initial?.attachmentName ?? null,
  );
  const [attachmentPath, setAttachmentPath] = useState<string | null>(
    initial?.attachmentPath ?? null,
  );
  const [pending, setPending] = useState<PendingAttachment | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso à galeria para anexar imagens.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPending({
        uri: asset.uri,
        name: asset.fileName ?? `comprovante-${Date.now()}.jpg`,
      });
      setAttachmentName(asset.fileName ?? "comprovante.jpg");
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPending({ uri: asset.uri, name: asset.name });
      setAttachmentName(asset.name);
    }
  };

  const clearAttachment = () => {
    setPending(null);
    setAttachmentName(null);
    setAttachmentUrl(null);
    setAttachmentPath(null);
  };

  const submit = async () => {
    setError(null);
    const numericAmount = Number(amount.replace(",", "."));
    if (!description.trim()) {
      setError("Descreva a transação.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (!user) {
      setError("Sessão expirada.");
      return;
    }

    setSaving(true);
    try {
      let finalUrl = attachmentUrl;
      let finalName = attachmentName;
      let finalPath = attachmentPath;

      // Se o usuario escolheu um novo arquivo, enviamos ao Storage antes de salvar.
      if (pending) {
        const uploaded = await uploadAttachment(
          user.uid,
          pending.uri,
          pending.name,
        );
        finalUrl = uploaded.url;
        finalName = uploaded.name;
        finalPath = uploaded.path;
      }

      await onSubmit({
        type,
        category,
        amount: numericAmount,
        description: description.trim(),
        date,
        attachmentUrl: finalUrl,
        attachmentName: finalName,
        attachmentPath: finalPath,
      });
    } catch (submitError) {
      setError((submitError as Error).message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.chips}>
          {(Object.keys(transactionTypeLabels) as TransactionType[]).map(
            (option) => (
              <Chip
                key={option}
                label={transactionTypeLabels[option]}
                active={option === type}
                onPress={() => setType(option)}
              />
            ),
          )}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            setCategory(suggestCategory(value));
          }}
          placeholder="Ex.: Mercado do mês"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.hint}>
          A categoria é sugerida pela descrição e pode ser ajustada.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.chips}>
          {(Object.keys(categoryLabels) as TransactionCategory[]).map(
            (option) => (
              <Chip
                key={option}
                label={categoryLabels[option]}
                active={option === category}
                onPress={() => setCategory(option)}
              />
            ),
          )}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Comprovante (opcional)</Text>
        {attachmentName ? (
          <View style={styles.attachmentRow}>
            <Text style={styles.attachmentName} numberOfLines={1}>
              {attachmentName}
            </Text>
            <Pressable onPress={clearAttachment}>
              <Text style={styles.remove}>Remover</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.hint}>Anexe uma foto ou PDF do recibo.</Text>
        )}
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button label="Galeria" variant="outline" onPress={pickImage} />
          </View>
          <View style={styles.flex}>
            <Button label="Arquivo" variant="outline" onPress={pickDocument} />
          </View>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label={submitLabel} onPress={submit} loading={saving} />
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  field: { gap: spacing.xs },
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: spacing.md },
  label: { fontSize: typography.body, fontWeight: "600", color: colors.text },
  hint: { fontSize: typography.caption, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  chipText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
  },
  chipTextActive: { color: colors.brandDark },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  attachmentName: { flex: 1, fontSize: typography.caption, color: colors.text },
  remove: {
    color: colors.danger,
    fontWeight: "600",
    fontSize: typography.caption,
  },
  error: { color: colors.danger, fontSize: typography.body },
});
