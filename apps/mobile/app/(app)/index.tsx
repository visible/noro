import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Svg, Path, Rect, Circle } from "react-native-svg";
import { usevault, type VaultItem, type ItemType } from "../../stores";

const colors = {
  bg: "#0a0a0a",
  accent: "#d4b08c",
  surface: "#141414",
  surfaceHover: "#1a1a1a",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "#666666",
  subtle: "#999999",
};

type FilterType = "all" | ItemType;

const filters: { type: FilterType; label: string }[] = [
  { type: "all", label: "All" },
  { type: "login", label: "Logins" },
  { type: "card", label: "Cards" },
  { type: "note", label: "Notes" },
  { type: "identity", label: "Identity" },
  { type: "ssh", label: "SSH" },
  { type: "api", label: "API" },
];

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={colors.muted} strokeWidth={1.5} />
      <Path d="M21 21l-4.35-4.35" stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={filled ? colors.accent : "none"}>
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={filled ? colors.accent : colors.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14m-7-7h14" stroke="#0a0a0a" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function VaultIcon() {
  return (
    <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={4} width={20} height={16} rx={3} stroke={colors.accent} strokeWidth={1.5} />
      <Circle cx={12} cy={12} r={4} stroke={colors.accent} strokeWidth={1.5} />
      <Path d="M12 10v4M10 12h4" stroke={colors.accent} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ItemIcon({ type }: { type: ItemType }) {
  const c = "rgba(255,255,255,0.7)";
  switch (type) {
    case "login":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={11} width={18} height={10} rx={2} stroke={c} strokeWidth={1.5} />
          <Path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "card":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x={2} y={5} width={20} height={14} rx={2} stroke={c} strokeWidth={1.5} />
          <Path d="M2 10h20" stroke={c} strokeWidth={1.5} />
          <Path d="M6 15h4" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "note":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth={1.5} />
          <Path d="M14 2v6h6M8 13h8M8 17h4" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "identity":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={8} r={4} stroke={c} strokeWidth={1.5} />
          <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "ssh":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M4 17l6-6-6-6M12 19h8" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "api":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M10 20l4-16M6 9l-4 3 4 3M18 9l4 3-4 3" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={11} width={18} height={10} rx={2} stroke={c} strokeWidth={1.5} />
          <Path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
  }
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function VaultListItem({ item, onPress, onFavorite, wide }: { item: VaultItem; onPress: () => void; onFavorite: () => void; wide: boolean }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePressIn = () => { scale.value = withSpring(0.98, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

  const subtitle = useMemo(() => {
    const data = item.data as Record<string, unknown>;
    if (item.type === "login") return (data.username || data.email || data.url || "") as string;
    if (item.type === "card") return `**** ${String(data.number || "").slice(-4)}`;
    if (item.type === "note") return item.tags.length > 0 ? item.tags.join(", ") : "secure note";
    if (item.type === "identity") return (data.email || data.firstname || "") as string;
    return item.type;
  }, [item]);

  return (
    <Animated.View style={animatedStyle} entering={FadeIn.duration(200)} layout={Layout.springify()}>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.listItem, wide && styles.listItemWide]}
      >
        <View style={styles.listItemIcon}>
          <ItemIcon type={item.type} />
        </View>
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>{item.title}</Text>
          {subtitle ? <Text style={styles.listItemSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onFavorite(); }} hitSlop={12} style={styles.favoriteButton}>
          <StarIcon filled={item.favorite} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function SectionHeader({ title, count, collapsed, onToggle }: { title: string; count: number; collapsed: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>
      <Animated.View style={{ transform: [{ rotate: collapsed ? "-90deg" : "0deg" }] }}>
        <ChevronIcon />
      </Animated.View>
    </Pressable>
  );
}

function EmptyState({ search, onAdd }: { search: string; onAdd: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.emptyIconContainer}>
        <VaultIcon />
      </Animated.View>
      <Animated.Text entering={FadeInUp.delay(200).duration(400)} style={styles.emptyTitle}>
        {search ? "no results found" : "your vault is empty"}
      </Animated.Text>
      <Animated.Text entering={FadeInUp.delay(300).duration(400)} style={styles.emptySubtitle}>
        {search ? "try a different search term" : "securely store your passwords, cards,\nand sensitive information"}
      </Animated.Text>
      {!search && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Pressable onPress={onAdd} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>add first item</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

export default function VaultScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, loading, error, fetch, update } = usevault();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);

  const isTablet = width >= 768;
  const horizontalPadding = isTablet ? Math.max(40, (width - 600) / 2) : 20;

  useEffect(() => { fetch(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const toggleFavorite = useCallback(async (id: string, current: boolean) => {
    await update(id, { favorite: !current });
  }, [update]);

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => !item.deletedAt);
    if (filter !== "all") result = result.filter((item) => item.type === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(q) || item.tags.some((tag) => tag.toLowerCase().includes(q)));
    }
    return result;
  }, [items, filter, search]);

  const favorites = useMemo(() => filteredItems.filter((item) => item.favorite), [filteredItems]);
  const regular = useMemo(() => filteredItems.filter((item) => !item.favorite), [filteredItems]);

  const handleItemPress = (id: string) => router.push({ pathname: "/(app)/item/[id]", params: { id } });
  const handleAddItem = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/(app)/item/new"); };

  if (loading && items.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>loading vault...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, isTablet && styles.titleTablet]}>vault</Text>
        <Text style={styles.subtitle}>{items.length} {items.length === 1 ? "item" : "items"}</Text>
      </View>

      <View style={[styles.searchContainer, { marginHorizontal: horizontalPadding }]}>
        <View style={styles.searchIcon}><SearchIcon /></View>
        <TextInput
          style={styles.searchInput}
          placeholder="search vault..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={[styles.filtersContent, { paddingHorizontal: horizontalPadding }]}>
        {filters.map((f) => <FilterChip key={f.type} label={f.label} active={filter === f.type} onPress={() => setFilter(f.type)} />)}
      </ScrollView>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPadding, paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={onRefresh}><Text style={styles.retryText}>retry</Text></Pressable>
          </View>
        )}

        {favorites.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="favorites" count={favorites.length} collapsed={favoritesCollapsed} onToggle={() => setFavoritesCollapsed(!favoritesCollapsed)} />
            {!favoritesCollapsed && (
              <View style={styles.sectionItems}>
                {favorites.map((item) => <VaultListItem key={item.id} item={item} onPress={() => handleItemPress(item.id)} onFavorite={() => toggleFavorite(item.id, item.favorite)} wide={isTablet} />)}
              </View>
            )}
          </View>
        )}

        {regular.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="all items" count={regular.length} collapsed={false} onToggle={() => {}} />
            <View style={styles.sectionItems}>
              {regular.map((item) => <VaultListItem key={item.id} item={item} onPress={() => handleItemPress(item.id)} onFavorite={() => toggleFavorite(item.id, item.favorite)} wide={isTablet} />)}
            </View>
          </View>
        )}

        {filteredItems.length === 0 && !loading && <EmptyState search={search} onAdd={handleAddItem} />}
      </ScrollView>

      <Pressable onPress={handleAddItem} style={({ pressed }) => [styles.fab, { bottom: 20 + insets.bottom }, pressed && styles.fabPressed]}>
        <PlusIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 16, fontSize: 15, color: colors.muted },
  header: { paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 34, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  titleTablet: { fontSize: 40 },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginTop: 16, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  searchIcon: { paddingLeft: 16, paddingRight: 8 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: colors.text, paddingRight: 16 },
  filtersContainer: { marginTop: 20, maxHeight: 44 },
  filtersContent: { gap: 10, flexDirection: "row" },
  filterChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterChipText: { fontSize: 14, fontWeight: "600", color: colors.subtle },
  filterChipTextActive: { color: colors.bg },
  listContainer: { flex: 1, marginTop: 20 },
  listContent: {},
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, marginBottom: 10 },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: colors.muted, textTransform: "uppercase", letterSpacing: 1 },
  countBadge: { backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 12, fontWeight: "600", color: colors.subtle },
  sectionItems: { gap: 8 },
  listItem: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  listItemWide: { padding: 20 },
  listItemIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  listItemContent: { flex: 1, marginLeft: 16 },
  listItemTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  listItemSubtitle: { fontSize: 14, color: colors.muted, marginTop: 3 },
  favoriteButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyIconContainer: { width: 100, height: 100, borderRadius: 28, backgroundColor: "rgba(212,176,140,0.08)", borderWidth: 1, borderColor: "rgba(212,176,140,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 28 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 12 },
  emptySubtitle: { fontSize: 15, color: colors.muted, textAlign: "center", lineHeight: 22 },
  emptyButton: { marginTop: 28, paddingHorizontal: 28, paddingVertical: 14, backgroundColor: colors.accent, borderRadius: 14 },
  emptyButtonText: { fontSize: 15, fontWeight: "600", color: colors.bg },
  errorBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(239,68,68,0.1)", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  errorText: { fontSize: 14, color: "#ef4444", flex: 1 },
  retryText: { fontSize: 14, fontWeight: "600", color: colors.accent, marginLeft: 12 },
  fab: { position: "absolute", right: 20, width: 60, height: 60, borderRadius: 20, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  fabPressed: { transform: [{ scale: 0.95 }] },
});
