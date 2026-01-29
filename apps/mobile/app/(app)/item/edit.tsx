import { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { usevault, type VaultItem, type UpdateItemInput } from "../../../stores";
import { TrashIcon } from "../../../components/icons";
import { fieldConfigs } from "../../../components/types";
import { colors, typeColors } from "./_components/constants";
import { FormHeader } from "./_components/header";
import { FieldInput } from "./_components/field";
import { TagsInput } from "./_components/tags";

export default function EditItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, update, delete: deleteItem } = usevault();
  const [item, setItem] = useState<VaultItem | null>(null);
  const [title, setTitle] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const originalData = useRef<{ title: string; data: Record<string, string>; tags: string[] } | null>(null);

  useEffect(() => {
    const found = items.find((i) => i.id === id);
    if (found) {
      setItem(found);
      setTitle(found.title);
      const itemData = found.data as Record<string, unknown>;
      const stringData: Record<string, string> = {};
      Object.entries(itemData).forEach(([key, value]) => { if (value !== undefined && value !== null) stringData[key] = String(value); });
      setData(stringData);
      setTags([...found.tags]);
      originalData.current = { title: found.title, data: { ...stringData }, tags: [...found.tags] };
    }
  }, [id, items]);

  const isModified = useMemo(() => {
    if (!originalData.current) return false;
    return title !== originalData.current.title || JSON.stringify(data) !== JSON.stringify(originalData.current.data) || JSON.stringify(tags) !== JSON.stringify(originalData.current.tags);
  }, [title, data, tags]);

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isModified) {
      Alert.alert("discard changes?", "you have unsaved changes. are you sure you want to close?", [
        { text: "keep editing", style: "cancel" },
        { text: "discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else router.back();
  }

  function handleAddTag() {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) { setTags((p) => [...p, tag]); setNewTag(""); }
  }

  function handleDelete() {
    if (!item) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("delete item", `are you sure you want to delete "${item.title}"? this action cannot be undone.`, [
      { text: "cancel", style: "cancel" },
      { text: "delete", style: "destructive", onPress: async () => { await deleteItem(item.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.replace("/(app)"); } },
    ]);
  }

  async function handleSave() {
    if (!item || !title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("missing title", "please enter a title for this item");
      return;
    }

    const fields = fieldConfigs[item.type];
    const missing = fields.filter((f) => f.required).find((f) => !data[f.name]?.trim());
    if (missing) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("missing field", `please fill in the ${missing.label} field`);
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await update(item.id, { title: title.trim(), data, tags } as UpdateItemInput);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("error", "failed to update item. please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loading}><Text style={styles.loadingText}>loading...</Text></View>
      </View>
    );
  }

  const fields = fieldConfigs[item.type] || [];

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FormHeader type={item.type} title={`edit ${item.type}`} onClose={handleClose} onSave={handleSave} saving={saving} saveDisabled={!title.trim() || saving || !isModified} />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.delay(50).duration(200)} style={styles.titleSection}>
          <TextInput style={styles.titleInput} placeholder="item name" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} autoCorrect={false} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.fieldsSection}>
          {fields.map((field, index) => (
            <FieldInput key={field.name} index={index} label={field.label} type={field.type} required={field.required} value={data[field.name] || ""} onChange={(v) => setData((p) => ({ ...p, [field.name]: v }))} isPasswordVisible={visiblePasswords.has(field.name)} onTogglePassword={() => setVisiblePasswords((p) => { const n = new Set(p); n.has(field.name) ? n.delete(field.name) : n.add(field.name); return n; })} />
          ))}
        </Animated.View>
        <TagsInput tags={tags} newTag={newTag} onNewTagChange={setNewTag} onAddTag={handleAddTag} onRemoveTag={(t) => setTags((p) => p.filter((x) => x !== t))} />
        <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.dangerSection}>
          <Text style={styles.sectionLabel}>danger zone</Text>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <TrashIcon size={18} color={colors.error} />
            <Text style={styles.deleteButtonText}>delete this item</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: colors.muted, fontSize: 15 },
  scroll: { flex: 1 },
  formContent: { paddingHorizontal: 20 },
  titleSection: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)", marginBottom: 24 },
  titleInput: { fontSize: 24, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  fieldsSection: { gap: 16, marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  dangerSection: { paddingTop: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: colors.error + "10", paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.error + "20" },
  deleteButtonText: { fontSize: 15, fontWeight: "600", color: colors.error },
});
