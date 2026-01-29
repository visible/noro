import { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Svg, Path, Rect, Circle } from "react-native-svg";

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

interface VaultItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle: string;
  favorite: boolean;
  tags: string[];
  lastUsed?: string;
}

const mockItems: VaultItem[] = [
  { id: "1", type: "login", title: "GitHub", subtitle: "josh@noro.sh", favorite: true, tags: ["work", "dev"], lastUsed: "2h ago" },
  { id: "2", type: "login", title: "Vercel", subtitle: "josh@noro.sh", favorite: true, tags: ["work", "hosting"], lastUsed: "5m ago" },
  { id: "3", type: "card", title: "Chase Sapphire", subtitle: "****4242", favorite: false, tags: ["personal", "travel"], lastUsed: "1d ago" },
  { id: "4", type: "login", title: "AWS Console", subtitle: "root@noro.sh", favorite: false, tags: ["work", "cloud"], lastUsed: "3h ago" },
  { id: "5", type: "note", title: "Recovery Codes", subtitle: "10 items", favorite: true, tags: ["backup"], lastUsed: "1w ago" },
  { id: "6", type: "ssh", title: "Production Server", subtitle: "ed25519", favorite: false, tags: ["work", "servers"], lastUsed: "1d ago" },
  { id: "7", type: "api", title: "OpenAI API", subtitle: "sk-***abc", favorite: false, tags: ["work", "ai"], lastUsed: "4h ago" },
  { id: "8", type: "identity", title: "Personal Info", subtitle: "Josh", favorite: false, tags: ["personal"], lastUsed: "2w ago" },
  { id: "9", type: "login", title: "Stripe", subtitle: "josh@noro.sh", favorite: false, tags: ["work", "payments"], lastUsed: "6h ago" },
  { id: "10", type: "login", title: "Cloudflare", subtitle: "josh@noro.sh", favorite: false, tags: ["work", "dns"], lastUsed: "12h ago" },
];

const recentSearches = ["github", "aws", "stripe api", "ssh keys"];

const popularTags = ["work", "personal", "dev", "cloud", "payments"];

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={colors.muted} strokeWidth={1.5} />
      <Path d="M21 21l-4.35-4.35" stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.muted} strokeWidth={1.5} />
      <Path d="M12 7v5l3 3" stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function TagIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 7h.01M21 12l-9 9-9-9 9-9h8a2 2 0 012 2v8z"
        stroke={colors.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FilterIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6h16M6 12h12M8 18h8"
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
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
        </Svg>
      );
    case "note":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={iconColor} strokeWidth={1.5} />
          <Path d="M14 2v6h6" stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
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

function SearchResultItem({ item }: { item: VaultItem }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      entering={FadeIn.duration(150)}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        style={styles.resultItem}
      >
        <View style={styles.resultIcon}>
          <ItemIcon type={item.type} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          {item.tags.length > 0 && (
            <View style={styles.tagRow}>
              {item.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {item.lastUsed && (
          <Text style={styles.resultTime}>{item.lastUsed}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function QuickFilterChip({
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
      style={[styles.quickFilter, active && styles.quickFilterActive]}
    >
      <Text style={[styles.quickFilterText, active && styles.quickFilterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    if (!search && !selectedType && !selectedTag) return [];

    let filtered = mockItems;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedType) {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    if (selectedTag) {
      filtered = filtered.filter((item) => item.tags.includes(selectedTag));
    }

    return filtered;
  }, [search, selectedType, selectedTag]);

  const hasQuery = search || selectedType || selectedTag;

  const handleClear = useCallback(() => {
    setSearch("");
    setSelectedType(null);
    setSelectedTag(null);
    inputRef.current?.focus();
  }, []);

  const handleRecentSearch = useCallback((term: string) => {
    setSearch(term);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [selectedTag]);

  const types: { type: ItemType; label: string }[] = [
    { type: "login", label: "Logins" },
    { type: "card", label: "Cards" },
    { type: "note", label: "Notes" },
    { type: "ssh", label: "SSH" },
    { type: "api", label: "API" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <SearchIcon />
          </View>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search items, tags, notes..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={handleClear} style={styles.clearButton}>
              <CloseIcon />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => {
            setShowFilters(!showFilters);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
        >
          <FilterIcon />
        </Pressable>
      </View>

      {showFilters && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.filtersPanel}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {types.map(({ type, label }) => (
                  <QuickFilterChip
                    key={type}
                    label={label}
                    active={selectedType === type}
                    onPress={() => setSelectedType(selectedType === type ? null : type)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Tags</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {popularTags.map((tag) => (
                  <QuickFilterChip
                    key={tag}
                    label={tag}
                    active={selectedTag === tag}
                    onPress={() => handleTagSelect(tag)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {!hasQuery ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ClockIcon />
                <Text style={styles.sectionTitle}>Recent Searches</Text>
              </View>
              <View style={styles.recentList}>
                {recentSearches.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => handleRecentSearch(term)}
                    style={styles.recentItem}
                  >
                    <Text style={styles.recentText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TagIcon />
                <Text style={styles.sectionTitle}>Popular Tags</Text>
              </View>
              <View style={styles.tagList}>
                {popularTags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => handleTagSelect(tag)}
                    style={[styles.tagChip, selectedTag === tag && styles.tagChipActive]}
                  >
                    <Text style={[styles.tagChipText, selectedTag === tag && styles.tagChipTextActive]}>
                      #{tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsCount}>
              {results.length} {results.length === 1 ? "result" : "results"}
            </Text>
            {results.length > 0 ? (
              <View style={styles.resultsList}>
                {results.map((item) => (
                  <SearchResultItem key={item.id} item={item} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <SearchIcon />
                </View>
                <Text style={styles.emptyTitle}>No results</Text>
                <Text style={styles.emptySubtitle}>
                  Try different keywords or filters
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  clearButton: {
    padding: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filtersPanel: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickFilter: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickFilterActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.subtle,
  },
  quickFilterTextActive: {
    color: colors.bg,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },
  recentList: {
    gap: 4,
  },
  recentItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 6,
  },
  recentText: {
    fontSize: 15,
    color: colors.text,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.subtle,
  },
  tagChipTextActive: {
    color: colors.bg,
  },
  resultsSection: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
  },
  resultsList: {
    gap: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: colors.surface,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.bg,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.subtle,
  },
  resultTime: {
    fontSize: 12,
    color: colors.muted,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
});
