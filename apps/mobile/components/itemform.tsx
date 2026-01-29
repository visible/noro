import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { XIcon, EyeIcon, EyeSlashIcon, CheckIcon } from "./icons";
import { TypePicker } from "./typepicker";
import { TagsInput } from "./tagsinput";
import type { ItemType, VaultItem, FieldConfig, ItemDataMap } from "./types";
import { fieldConfigs, typeLabels } from "./types";

interface ItemFormProps {
  item?: VaultItem | null;
  defaultType?: ItemType;
  onSave: (data: { type: ItemType; title: string; data: Record<string, unknown>; tags: string[] }) => void;
  onClose: () => void;
  allTags?: string[];
}

export function ItemForm({ item, defaultType, onSave, onClose, allTags = [] }: ItemFormProps) {
  const [type, setType] = useState<ItemType>(item?.type || defaultType || "login");
  const [title, setTitle] = useState(item?.title || "");
  const [data, setData] = useState<Record<string, unknown>>(item?.data || {});
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const titleRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!item) setData({});
  }, [type, item]);

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  function handleSave() {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({ type, title: title.trim(), data, tags });
  }

  function handleClose() {
    Haptics.selectionAsync();
    onClose();
  }

  const fields = fieldConfigs[type];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={12}>
          <XIcon size={22} color="rgba(255,255,255,0.5)" />
        </Pressable>
        <Text style={styles.headerTitle}>{item ? "edit" : "new"} item</Text>
        <Pressable onPress={handleSave} style={styles.saveButton} hitSlop={12}>
          <CheckIcon size={22} color="#d4b08c" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!item && <TypePicker value={type} onChange={setType} />}

        <View style={styles.field}>
          <Text style={styles.label}>title</Text>
          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={setTitle}
            placeholder={typeLabels[type]}
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
            returnKeyType="next"
          />
        </View>

        {renderFields(fields, data, setData)}

        <TagsInput tags={tags} onChange={setTags} suggestions={allTags} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={handleClose} style={styles.cancelButton}>
          <Text style={styles.cancelText}>cancel</Text>
        </Pressable>
        <Pressable onPress={handleSave} style={styles.submitButton}>
          <Text style={styles.submitText}>save</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function renderFields(
  fields: FieldConfig[],
  data: Record<string, unknown>,
  setData: (d: Record<string, unknown>) => void
) {
  const result: React.ReactNode[] = [];
  let i = 0;
  while (i < fields.length) {
    const field = fields[i];
    const nextField = fields[i + 1];
    if (field.half && nextField?.half) {
      result.push(
        <View key={`${field.name}-${nextField.name}`} style={styles.row}>
          <View style={styles.halfField}>
            <FormField field={field} value={data[field.name]} onChange={(v) => setData({ ...data, [field.name]: v })} />
          </View>
          <View style={styles.halfField}>
            <FormField field={nextField} value={data[nextField.name]} onChange={(v) => setData({ ...data, [nextField.name]: v })} />
          </View>
        </View>
      );
      i += 2;
    } else {
      result.push(
        <View key={field.name}>
          <FormField field={field} value={data[field.name]} onChange={(v) => setData({ ...data, [field.name]: v })} />
        </View>
      );
      i += 1;
    }
  }
  return result;
}

interface FormFieldProps {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FormField({ field, value, onChange }: FormFieldProps) {
  const [show, setShow] = useState(false);

  if (field.type === "textarea") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <TextInput
          value={(value as string) || ""}
          onChangeText={onChange}
          placeholder={field.label}
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    );
  }

  if (field.type === "password") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={(value as string) || ""}
            onChangeText={onChange}
            placeholder={field.label}
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={[styles.input, styles.passwordInput]}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable onPress={() => setShow(!show)} style={styles.passwordToggle} hitSlop={8}>
            {show ? (
              <EyeSlashIcon size={18} color="rgba(255,255,255,0.4)" />
            ) : (
              <EyeIcon size={18} color="rgba(255,255,255,0.4)" />
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <TextInput
        value={field.type === "number" ? String(value || "") : (value as string) || ""}
        onChangeText={(v) => onChange(field.type === "number" ? Number(v) || undefined : v)}
        placeholder={field.label}
        placeholderTextColor="rgba(255,255,255,0.3)"
        style={styles.input}
        keyboardType={field.type === "number" ? "numeric" : field.type === "email" ? "email-address" : field.type === "url" ? "url" : "default"}
        autoCapitalize={field.type === "email" || field.type === "url" ? "none" : "sentences"}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  saveButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,176,140,0.15)",
    borderRadius: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 8,
    textTransform: "lowercase",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#fff",
  },
  textarea: {
    minHeight: 100,
    paddingTop: 14,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d4b08c",
    borderRadius: 14,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0a0a0a",
  },
});
