import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { TypeIcon } from "./icons";
import type { ItemType } from "./types";
import { typeLabels } from "./types";

interface TypePickerProps {
  value: ItemType;
  onChange: (type: ItemType) => void;
}

const types: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export function TypePicker({ value, onChange }: TypePickerProps) {
  function handleSelect(type: ItemType) {
    if (type !== value) {
      Haptics.selectionAsync();
      onChange(type);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {types.map((type) => {
          const selected = type === value;
          return (
            <Pressable
              key={type}
              onPress={() => handleSelect(type)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <TypeIcon
                type={type}
                size={18}
                color={selected ? "#d4b08c" : "rgba(255,255,255,0.4)"}
              />
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {typeLabels[type].replace(/s$/, "")}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface TypePickerModalProps {
  value: ItemType;
  onChange: (type: ItemType) => void;
  onClose: () => void;
}

export function TypePickerModal({ value, onChange, onClose }: TypePickerModalProps) {
  function handleSelect(type: ItemType) {
    Haptics.selectionAsync();
    onChange(type);
    onClose();
  }

  return (
    <View style={styles.modal}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>select type</Text>
        <Pressable onPress={onClose} style={styles.modalClose}>
          <Text style={styles.modalCloseText}>done</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {types.map((type) => {
          const selected = type === value;
          return (
            <Pressable
              key={type}
              onPress={() => handleSelect(type)}
              style={[styles.gridItem, selected && styles.gridItemSelected]}
            >
              <View style={[styles.gridIcon, selected && styles.gridIconSelected]}>
                <TypeIcon
                  type={type}
                  size={24}
                  color={selected ? "#d4b08c" : "rgba(255,255,255,0.5)"}
                />
              </View>
              <Text style={[styles.gridText, selected && styles.gridTextSelected]}>
                {typeLabels[type].replace(/s$/, "")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 10,
    textTransform: "lowercase",
    marginLeft: 4,
  },
  scroll: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  optionSelected: {
    backgroundColor: "rgba(212,176,140,0.12)",
    borderColor: "rgba(212,176,140,0.3)",
  },
  optionText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  optionTextSelected: {
    color: "#d4b08c",
    fontWeight: "500",
  },
  modal: {
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  modalClose: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCloseText: {
    fontSize: 15,
    color: "#d4b08c",
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  gridItem: {
    width: "22%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  gridItemSelected: {
    backgroundColor: "rgba(212,176,140,0.12)",
    borderColor: "rgba(212,176,140,0.3)",
  },
  gridIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  gridIconSelected: {
    backgroundColor: "rgba(212,176,140,0.15)",
  },
  gridText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  gridTextSelected: {
    color: "#d4b08c",
    fontWeight: "500",
  },
});
