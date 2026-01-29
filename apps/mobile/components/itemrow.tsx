import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { TypeIcon, StarIcon, StarOutlineIcon, TrashIcon, PencilIcon } from "./icons";
import type { VaultItem, ItemType, LoginData, CardData, IdentityData, ApiData, OtpData, PasskeyData } from "./types";

interface ItemRowProps {
  item: VaultItem;
  onPress: () => void;
  onFavorite: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getSubtitle(item: VaultItem): string | null {
  const data = item.data;
  switch (item.type) {
    case "login":
      return (data as LoginData).username || (data as LoginData).url || null;
    case "card":
      return (data as CardData).holder || null;
    case "identity": {
      const id = data as IdentityData;
      if (id.firstname || id.lastname) {
        return [id.firstname, id.lastname].filter(Boolean).join(" ");
      }
      return id.email || null;
    }
    case "api":
      return (data as ApiData).endpoint || null;
    case "otp":
      return (data as OtpData).issuer || (data as OtpData).account || null;
    case "passkey":
      return (data as PasskeyData).rpid || null;
    default:
      return null;
  }
}

const ACTION_WIDTH = 70;
const SWIPE_THRESHOLD = 50;

export function ItemRow({ item, onPress, onFavorite, onEdit, onDelete }: ItemRowProps) {
  const subtitle = getSubtitle(item);
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      contextX.value = translateX.value;
    },
    onActive: (event) => {
      const newX = contextX.value + event.translationX;
      if (onEdit && newX > 0) {
        translateX.value = Math.min(newX, ACTION_WIDTH);
      } else if (onDelete && newX < 0) {
        translateX.value = Math.max(newX, -ACTION_WIDTH);
      }
    },
    onEnd: (event) => {
      if (event.translationX > SWIPE_THRESHOLD && onEdit) {
        translateX.value = withTiming(ACTION_WIDTH);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      } else if (event.translationX < -SWIPE_THRESHOLD && onDelete) {
        translateX.value = withTiming(-ACTION_WIDTH);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      } else {
        translateX.value = withTiming(0);
      }
    },
  });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? 1 : 0,
    width: translateX.value > 0 ? translateX.value : 0,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? 1 : 0,
    width: translateX.value < 0 ? -translateX.value : 0,
  }));

  function handlePress() {
    translateX.value = withTiming(0);
    onPress();
  }

  function handleFavorite() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavorite();
  }

  function handleEdit() {
    translateX.value = withTiming(0);
    onEdit?.();
  }

  function handleDelete() {
    translateX.value = withTiming(0);
    onDelete?.();
  }

  return (
    <View style={styles.container}>
      {onEdit && (
        <Animated.View style={[styles.leftAction, leftActionStyle]}>
          <Pressable onPress={handleEdit} style={styles.actionButton}>
            <PencilIcon size={22} color="#d4b08c" />
          </Pressable>
        </Animated.View>
      )}
      {onDelete && (
        <Animated.View style={[styles.rightAction, rightActionStyle]}>
          <Pressable onPress={handleDelete} style={styles.actionButton}>
            <TrashIcon size={22} color="#ef4444" />
          </Pressable>
        </Animated.View>
      )}
      <PanGestureHandler onGestureEvent={gestureHandler} activeOffsetX={[-10, 10]}>
        <Animated.View style={[styles.row, rowStyle]}>
          <Pressable onPress={handlePress} style={styles.content}>
            <View style={styles.icon}>
              <TypeIcon type={item.type} size={20} color="rgba(255,255,255,0.5)" />
            </View>
            <View style={styles.text}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
              {item.tags.length > 0 && (
                <View style={styles.tags}>
                  {item.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 2 && (
                    <Text style={styles.tagMore}>+{item.tags.length - 2}</Text>
                  )}
                </View>
              )}
            </View>
            <Pressable onPress={handleFavorite} style={styles.star} hitSlop={12}>
              {item.favorite ? <StarIcon size={18} /> : <StarOutlineIcon size={18} />}
            </Pressable>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  leftAction: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(212,176,140,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  rightAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(239,68,68,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  actionButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  tagMore: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
  star: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
