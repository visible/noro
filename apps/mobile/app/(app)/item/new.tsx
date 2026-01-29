import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn, FadeInDown, SlideInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { usevault, type ItemType, type CreateItemInput } from "../../../stores";
import { TypeIcon, ChevronRightIcon } from "../../../components/icons";
import { fieldConfigs, typeLabels } from "../../../components/types";
import { colors, typeColors } from "./_components/constants";
import { FormHeader } from "./_components/header";
import { FieldInput } from "./_components/field";
import { TagsInput } from "./_components/tags";

const types: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export default function NewItem() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { create } = usevault();
  const [step, setStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [title, setTitle] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const titleRef = useRef<TextInput>(null);

  useEffect(() => {
    if (step === "form" && titleRef.current) setTimeout(() => titleRef.current?.focus(), 300);
  }, [step]);

  function handleSelectType(type: ItemType) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedType(type);
    setStep("form");
  }

  function handleBack() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === "form") {
      if (modified) {
        Alert.alert("discard changes?", "you have unsaved changes. are you sure you want to go back?", [
          { text: "keep editing", style: "cancel" },
          { text: "discard", style: "destructive", onPress: () => { setStep("type"); setTitle(""); setData({}); setTags([]); setModified(false); } },
        ]);
      } else setStep("type");
    } else router.back();
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (modified) {
      Alert.alert("discard changes?", "you have unsaved changes. are you sure you want to close?", [
        { text: "keep editing", style: "cancel" },
        { text: "discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else router.back();
  }

  function handleAddTag() {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      setNewTag("");
      setModified(true);
    }
  }

  async function handleSave() {
    if (!selectedType || !title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("missing title", "please enter a title for this item");
      return;
    }

    const fields = fieldConfigs[selectedType];
    const missing = fields.filter((f) => f.required).find((f) => !data[f.name]?.trim());
    if (missing) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("missing field", `please fill in the ${missing.label} field`);
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await create({ type: selectedType, title: title.trim(), data, tags } as CreateItemInput);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("error", "failed to create item. please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (step === "type") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <FormHeader title="new item" onClose={handleClose} />
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.typeContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          <Animated.Text entering={FadeIn.duration(300)} style={styles.typeTitle}>what would you like{"\n"}to store?</Animated.Text>
          <View style={styles.typeGrid}>
            {types.map((type, index) => (
              <TypeCard key={type} type={type} index={index} onPress={() => handleSelectType(type)} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  const fields = selectedType ? fieldConfigs[selectedType] : [];

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FormHeader type={selectedType!} onClose={handleClose} onBack={handleBack} showBack onSave={handleSave} saving={saving} saveDisabled={!title.trim() || saving} />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={SlideInRight.duration(300)} style={styles.titleSection}>
          <TextInput ref={titleRef} style={styles.titleInput} placeholder="item name" placeholderTextColor={colors.muted} value={title} onChangeText={(v) => { setTitle(v); setModified(true); }} autoCorrect={false} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.fieldsSection}>
          {fields.map((field, index) => (
            <FieldInput key={field.name} index={index} label={field.label} type={field.type} required={field.required} value={data[field.name] || ""} onChange={(v) => { setData((p) => ({ ...p, [field.name]: v })); setModified(true); }} isPasswordVisible={visiblePasswords.has(field.name)} onTogglePassword={() => setVisiblePasswords((p) => { const n = new Set(p); n.has(field.name) ? n.delete(field.name) : n.add(field.name); return n; })} />
          ))}
        </Animated.View>
        <TagsInput tags={tags} newTag={newTag} onNewTagChange={setNewTag} onAddTag={handleAddTag} onRemoveTag={(t) => { setTags((p) => p.filter((x) => x !== t)); setModified(true); }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TypeCard({ type, index, onPress }: { type: ItemType; index: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPressIn={() => { scale.value = withSpring(0.95, { damping: 20 }); }} onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }} onPress={onPress}>
      <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(300)} style={[styles.typeCard, animatedStyle]}>
        <View style={[styles.typeIconBox, { backgroundColor: typeColors[type] + "20" }]}>
          <TypeIcon type={type} size={24} color={typeColors[type]} />
        </View>
        <Text style={styles.typeCardLabel}>{typeLabels[type]}</Text>
        <ChevronRightIcon size={18} color="rgba(255,255,255,0.2)" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  typeContent: { paddingHorizontal: 20 },
  typeTitle: { fontSize: 28, fontWeight: "700", color: colors.text, letterSpacing: -0.5, lineHeight: 36, marginTop: 20, marginBottom: 32 },
  typeGrid: { gap: 10 },
  typeCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  typeIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
  typeCardLabel: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text },
  formContent: { paddingHorizontal: 20 },
  titleSection: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)", marginBottom: 24 },
  titleInput: { fontSize: 24, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  fieldsSection: { gap: 16, marginBottom: 24 },
});
