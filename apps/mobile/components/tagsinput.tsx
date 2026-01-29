import { useState, useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { XIcon, TagIcon } from "./icons";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagsInput({ tags, onChange, suggestions = [], placeholder = "add tags..." }: TagsInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  function addTag(value: string) {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange([...tags, tag]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(tags.filter((t) => t !== tag));
  }

  function handleSubmit() {
    if (input.trim()) {
      addTag(input);
    }
  }

  function handleKeyPress(e: { nativeEvent: { key: string } }) {
    if (e.nativeEvent.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <TagIcon size={14} color="rgba(255,255,255,0.4)" />
        <Text style={styles.label}>tags</Text>
      </View>
      <Pressable
        style={[styles.inputContainer, focused && styles.inputContainerFocused]}
        onPress={() => inputRef.current?.focus()}
      >
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <Pressable onPress={() => removeTag(tag)} style={styles.tagRemove} hitSlop={8}>
                <XIcon size={12} color="rgba(255,255,255,0.5)" />
              </Pressable>
            </View>
          ))}
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            onKeyPress={handleKeyPress}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (input.trim()) addTag(input);
            }}
            placeholder={tags.length === 0 ? placeholder : ""}
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </Pressable>
      {focused && input && filtered.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestions}
          contentContainerStyle={styles.suggestionsContent}
          keyboardShouldPersistTaps="always"
        >
          {filtered.slice(0, 5).map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => addTag(suggestion)}
              style={styles.suggestion}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

interface TagListProps {
  tags: string[];
  max?: number;
  onPress?: (tag: string) => void;
}

export function TagList({ tags, max = 3, onPress }: TagListProps) {
  const visible = tags.slice(0, max);
  const remaining = tags.length - max;

  if (tags.length === 0) return null;

  return (
    <View style={styles.tagList}>
      {visible.map((tag) => (
        <Pressable
          key={tag}
          onPress={() => onPress?.(tag)}
          style={styles.tagListItem}
          disabled={!onPress}
        >
          <Text style={styles.tagListText}>{tag}</Text>
        </Pressable>
      ))}
      {remaining > 0 && <Text style={styles.tagListMore}>+{remaining}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    marginLeft: 4,
  },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textTransform: "lowercase",
  },
  inputContainer: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 52,
  },
  inputContainerFocused: {
    borderColor: "rgba(212,176,140,0.4)",
    backgroundColor: "rgba(212,176,140,0.05)",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  tagRemove: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
  },
  input: {
    flex: 1,
    minWidth: 80,
    fontSize: 14,
    color: "#fff",
    paddingVertical: 4,
  },
  suggestions: {
    marginTop: 10,
  },
  suggestionsContent: {
    gap: 8,
  },
  suggestion: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(212,176,140,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212,176,140,0.2)",
  },
  suggestionText: {
    fontSize: 13,
    color: "#d4b08c",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  tagListItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
  },
  tagListText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  tagListMore: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    marginLeft: 2,
  },
});
