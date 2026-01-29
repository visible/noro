import { View, TextInput, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { XIcon, PlusIcon, TagIcon } from "../icons";
import { colors } from "./constants";

interface TagsInputProps {
  tags: string[];
  newTag: string;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export function TagsInput({ tags, newTag, onNewTagChange, onAddTag, onRemoveTag }: TagsInputProps) {
  function handleRemove(tag: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemoveTag(tag);
  }

  function handleAdd() {
    if (newTag.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAddTag();
    }
  }

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.section}>
      <Text style={styles.label}>tags</Text>
      <View style={styles.container}>
        {tags.map((tag) => (
          <Pressable key={tag} style={styles.tag} onPress={() => handleRemove(tag)}>
            <TagIcon size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.tagText}>{tag}</Text>
            <XIcon size={12} color="rgba(255,255,255,0.4)" />
          </Pressable>
        ))}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="add tag"
            placeholderTextColor={colors.muted}
            value={newTag}
            onChangeText={onNewTagChange}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {newTag.trim() && (
            <Pressable style={styles.addButton} onPress={handleAdd}>
              <PlusIcon size={16} color={colors.accent} />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderStyle: "dashed",
    paddingLeft: 12,
    paddingRight: 4,
    minWidth: 100,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    paddingVertical: 8,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
});
