import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Svg, Path, Rect, Circle, G } from "react-native-svg";

const colors = {
  bg: "#0a0a0a",
  accent: "#d4b08c",
  surface: "#141414",
  surfaceHover: "#1a1a1a",
  border: "#1f1f1f",
  text: "#ffffff",
  muted: "#666666",
  subtle: "#999999",
};

type ItemType = "login" | "card" | "note" | "identity" | "ssh" | "api";
type FilterType = "all" | ItemType;

interface VaultItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle: string;
  favorite: boolean;
  icon?: string;
}

const mockItems: VaultItem[] = [
  { id: "1", type: "login", title: "GitHub", subtitle: "josh@noro.sh", favorite: true },
  { id: "2", type: "login", title: "Vercel", subtitle: "josh@noro.sh", favorite: true },
  { id: "3", type: "card", title: "Chase Sapphire", subtitle: "****4242", favorite: false },
  { id: "4", type: "login", title: "AWS Console", subtitle: "root@noro.sh", favorite: false },
  { id: "5", type: "note", title: "Recovery Codes", subtitle: "10 items", favorite: true },
  { id: "6", type: "ssh", title: "Production Server", subtitle: "ed25519", favorite: false },
  { id: "7", type: "api", title: "OpenAI API", subtitle: "sk-***abc", favorite: false },
  { id: "8", type: "identity", title: "Personal Info", subtitle: "Josh", favorite: false },
  { id: "9", type: "login", title: "Stripe", subtitle: "josh@noro.sh", favorite: false },
  { id: "10", type: "login", title: "Cloudflare", subtitle: "josh@noro.sh", favorite: false },
];

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
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={filled ? colors.accent : "none"}>
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
      <Path d="M12 5v14m-7-7h14" stroke="#0a0a0a" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ItemIcon({ type }: { type: ItemType }) {
  const iconColor = colors.text;
  switch (type) {
    case "login":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={11} width={18} height={10} rx={2} stroke={iconColor} strokeWidth={1.5} />
          <Path d="M7 11V7a5 5 0 0110 0v4" stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "card":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x={2} y={5} width={20} height={14} rx={2} stroke={iconColor} strokeWidth={1.5} />
          <Path d="M2 10h20" stroke={iconColor} strokeWidth={1.5} />
          <Path d="M6 15h4" stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "note":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={iconColor} strokeWidth={1.5} />
          <Path d="M14 2v6h6M8 13h8M8 17h4" stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "identity":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={8} r={4} stroke={iconColor} strokeWidth={1.5} />
          <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case "ssh":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M4 17l6-6-6-6M12 19h8" stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "api":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M10 20l4-16M6 9l-4 3 4 3M18 9l4 3-4 3" stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return null;
  }
}

function FilterChip({
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
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function VaultListItem({
  item,
  onPress,
  onFavorite,
}: {
  item: VaultItem;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View style={animatedStyle} entering={FadeIn.duration(200)} layout={Layout.springify()}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.listItem}
      >
        <View style={styles.listItemIcon}>
          <ItemIcon type={item.type} />
        </View>
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.listItemSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onFavorite();
          }}
          hitSlop={12}
          style={styles.favoriteButton}
        >
          <StarIcon filled={item.favorite} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function SectionHeader({
  title,
  count,
  collapsed,
  onToggle,
}: {
  title: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
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

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);
  const [items, setItems] = useState(mockItems);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
    );
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (filter !== "all") {
      result = result.filter((item) => item.type === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, filter, search]);

  const favorites = useMemo(() => filteredItems.filter((item) => item.favorite), [filteredItems]);
  const regular = useMemo(() => filteredItems.filter((item) => !item.favorite), [filteredItems]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Vault</Text>
        <Text style={styles.subtitle}>{items.length} items</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <SearchIcon />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vault..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((f) => (
          <FilterChip
            key={f.type}
            label={f.label}
            active={filter === f.type}
            onPress={() => setFilter(f.type)}
          />
        ))}
      </ScrollView>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {favorites.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Favorites"
              count={favorites.length}
              collapsed={favoritesCollapsed}
              onToggle={() => setFavoritesCollapsed(!favoritesCollapsed)}
            />
            {!favoritesCollapsed && (
              <View style={styles.sectionItems}>
                {favorites.map((item) => (
                  <VaultListItem
                    key={item.id}
                    item={item}
                    onPress={() => {}}
                    onFavorite={() => toggleFavorite(item.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {regular.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="All Items"
              count={regular.length}
              collapsed={false}
              onToggle={() => {}}
            />
            <View style={styles.sectionItems}>
              {regular.map((item) => (
                <VaultListItem
                  key={item.id}
                  item={item}
                  onPress={() => {}}
                  onFavorite={() => toggleFavorite(item.id)}
                />
              ))}
            </View>
          </View>
        )}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={5} width={18} height={14} rx={2} stroke={colors.muted} strokeWidth={1.5} />
                <Circle cx={12} cy={12} r={3} stroke={colors.muted} strokeWidth={1.5} />
              </Svg>
            </View>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              {search ? "Try adjusting your search" : "Add your first item to get started"}
            </Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <PlusIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    paddingLeft: 14,
    paddingRight: 4,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 10,
  },
  filtersContainer: {
    marginTop: 16,
    maxHeight: 40,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.subtle,
  },
  filterChipTextActive: {
    color: colors.bg,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.subtle,
  },
  sectionItems: {
    gap: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  listItemContent: {
    flex: 1,
    marginLeft: 14,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
