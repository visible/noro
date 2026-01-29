import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeIn, FadeInDown, interpolate, Extrapolation } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { usevault, type VaultItem } from "../../../stores";
import { TypeIcon, StarIcon, StarOutlineIcon, CopyIcon, TrashIcon, PencilIcon, ChevronDownIcon, TagIcon } from "../../../components/icons";
import { fieldConfigs } from "../../../components/types";
import { colors, typeColors } from "./constants";
import { Sheet, SheetItem, SheetDivider } from "./sheet";
import { TotpSection } from "./totp";
import { FieldCard } from "./card";
import { MoreIcon, formatDate } from "./utils";

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, update, delete: deleteItem } = usevault();
  const [item, setItem] = useState<VaultItem | null>(null);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpRemaining, setTotpRemaining] = useState(30);
  const [sheetOpen, setSheetOpen] = useState(false);
  const headerOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(30);

  useEffect(() => {
    const found = items.find((i) => i.id === id);
    if (found) { setItem(found); headerOpacity.value = withTiming(1, { duration: 300 }); contentTranslate.value = withSpring(0, { damping: 20, stiffness: 300 }); }
  }, [id, items]);

  useEffect(() => {
    if (!item?.data || item.type !== "login") return;
    const secret = (item.data as { totp?: string }).totp;
    if (!secret) return;
    function generateTOTP() { const epoch = Math.floor(Date.now() / 1000); setTotpRemaining(30 - (epoch % 30)); setTotpCode(Math.floor(100000 + Math.random() * 900000).toString()); }
    generateTOTP();
    const interval = setInterval(generateTOTP, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: contentTranslate.value }], opacity: interpolate(contentTranslate.value, [30, 0], [0, 1], Extrapolation.CLAMP) }));

  async function handleCopy(value: string, field: string) { await Clipboard.setStringAsync(value); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setCopiedField(field); setTimeout(() => setCopiedField(null), 2000); }
  function toggleVisibility(field: string) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setVisibleFields((prev) => { const next = new Set(prev); next.has(field) ? next.delete(field) : next.add(field); return next; }); }
  async function handleFavorite() { if (!item) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); await update(item.id, { favorite: !item.favorite }); }
  function handleEdit() { if (!item) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/(app)/item/edit", params: { id: item.id } }); }
  function handleDelete() { if (!item) return; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); Alert.alert("delete item", `are you sure you want to delete "${item.title}"? this action cannot be undone.`, [{ text: "cancel", style: "cancel" }, { text: "delete", style: "destructive", onPress: async () => { await deleteItem(item.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); } }]); }

  if (!item) return <View style={[s.container, { paddingTop: insets.top }]}><View style={s.loading}><Text style={s.loadingText}>loading...</Text></View></View>;

  const fields = fieldConfigs[item.type] || [];
  const hasTotp = item.type === "login" && (item.data as { totp?: string }).totp;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Animated.View style={[s.header, headerStyle]}>
        <Pressable style={s.backButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} hitSlop={12}><ChevronDownIcon size={24} color="rgba(255,255,255,0.6)" /></Pressable>
        <View style={s.headerActions}>
          <Pressable style={s.headerButton} onPress={handleFavorite} hitSlop={8}>{item.favorite ? <StarIcon size={22} color={colors.accent} /> : <StarOutlineIcon size={22} color="rgba(255,255,255,0.4)" />}</Pressable>
          <Pressable style={s.headerButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSheetOpen(true); }} hitSlop={8}><MoreIcon /></Pressable>
        </View>
      </Animated.View>
      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <Animated.View style={contentStyle}>
          <View style={s.hero}>
            <Animated.View entering={FadeIn.delay(100).duration(400)} style={[s.iconBox, { backgroundColor: typeColors[item.type] + "20" }]}><TypeIcon type={item.type} size={32} color={typeColors[item.type]} /></Animated.View>
            <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={s.title}>{item.title}</Animated.Text>
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[s.badge, { backgroundColor: typeColors[item.type] + "20" }]}><Text style={[s.badgeText, { color: typeColors[item.type] }]}>{item.type}</Text></Animated.View>
          </View>
          {hasTotp && <TotpSection code={totpCode} remaining={totpRemaining} onCopy={() => handleCopy(totpCode, "totp")} copied={copiedField === "totp"} />}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={s.fieldsSection}>
            <Text style={s.sectionLabel}>details</Text>
            {fields.map((field, index) => { const value = (item.data as Record<string, unknown>)[field.name]; if (!value) return null; return <FieldCard key={field.name} index={index} label={field.label} value={String(value)} isSecret={field.type === "password"} isVisible={visibleFields.has(field.name)} isCopied={copiedField === field.name} onToggle={() => toggleVisibility(field.name)} onCopy={() => handleCopy(String(value), field.name)} multiline={field.type === "textarea"} />; })}
          </Animated.View>
          {item.tags.length > 0 && <Animated.View entering={FadeInDown.delay(500).duration(400)} style={s.tagsSection}><Text style={s.sectionLabel}>tags</Text><View style={s.tagsRow}>{item.tags.map((tag) => <View key={tag} style={s.tag}><TagIcon size={12} color="rgba(255,255,255,0.5)" /><Text style={s.tagText}>{tag}</Text></View>)}</View></Animated.View>}
          <Animated.View entering={FadeInDown.delay(550).duration(400)} style={s.metaSection}><View style={s.metaRow}><Text style={s.metaLabel}>created</Text><Text style={s.metaValue}>{formatDate(item.createdAt)}</Text></View><View style={s.metaRow}><Text style={s.metaLabel}>updated</Text><Text style={s.metaValue}>{formatDate(item.updatedAt)}</Text></View></Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={s.actionsSection}><Pressable style={s.editButton} onPress={handleEdit}><PencilIcon size={18} color={colors.accent} /><Text style={s.editButtonText}>edit item</Text></Pressable><Pressable style={s.deleteButton} onPress={handleDelete}><TrashIcon size={18} color={colors.error} /><Text style={s.deleteButtonText}>delete</Text></Pressable></Animated.View>
        </Animated.View>
      </ScrollView>
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <SheetItem icon={<PencilIcon size={20} color={colors.accent} />} label="edit item" onPress={() => { setSheetOpen(false); handleEdit(); }} />
        <SheetItem icon={item.favorite ? <StarIcon size={20} /> : <StarOutlineIcon size={20} color="rgba(255,255,255,0.5)" />} label={item.favorite ? "remove from favorites" : "add to favorites"} onPress={() => { setSheetOpen(false); handleFavorite(); }} />
        <SheetItem icon={<CopyIcon size={20} color="rgba(255,255,255,0.5)" />} label="copy password" onPress={() => { const pwd = (item.data as { password?: string }).password; if (pwd) handleCopy(pwd, "password"); setSheetOpen(false); }} />
        <SheetDivider />
        <SheetItem icon={<TrashIcon size={20} />} label="delete item" destructive onPress={() => { setSheetOpen(false); handleDelete(); }} />
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: colors.muted, fontSize: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", transform: [{ rotate: "90deg" }] },
  headerActions: { flexDirection: "row", gap: 8 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  hero: { alignItems: "center", paddingTop: 8, paddingBottom: 32 },
  iconBox: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, letterSpacing: -0.5, marginBottom: 12, textAlign: "center" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldsSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  tagsSection: { marginBottom: 24 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  tagText: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  metaSection: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  metaLabel: { fontSize: 14, color: colors.muted },
  metaValue: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  actionsSection: { flexDirection: "row", gap: 12 },
  editButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.accent + "15", paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.accent + "30" },
  editButtonText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.error + "15", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: colors.error + "30" },
  deleteButtonText: { fontSize: 15, fontWeight: "600", color: colors.error },
});
