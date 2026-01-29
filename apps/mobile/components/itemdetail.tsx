import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { TypeIcon, StarIcon, StarOutlineIcon, PencilIcon, TrashIcon, XIcon } from "./icons";
import { FieldRow } from "./fieldrow";
import type { VaultItem, LoginData, CardData, IdentityData, SshData, ApiData, OtpData, PasskeyData, NoteData } from "./types";
import { typeLabels } from "./types";

interface ItemDetailProps {
  item: VaultItem;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}

export function ItemDetail({ item, onClose, onEdit, onDelete, onFavorite }: ItemDetailProps) {
  function handleFavorite() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavorite();
  }

  function renderFields() {
    switch (item.type) {
      case "login": {
        const d = item.data as LoginData;
        return (
          <>
            <FieldRow label="username" value={d.username || ""} />
            <FieldRow label="password" value={d.password || ""} sensitive />
            <FieldRow label="website" value={d.url || ""} />
            {d.totp && <FieldRow label="totp" value="" isTotp totpSecret={d.totp} />}
            <FieldRow label="notes" value={d.notes || ""} />
          </>
        );
      }
      case "note": {
        const d = item.data as NoteData;
        return <FieldRow label="content" value={d.content} />;
      }
      case "card": {
        const d = item.data as CardData;
        return (
          <>
            <FieldRow label="cardholder" value={d.holder} />
            <FieldRow label="card number" value={d.number} sensitive />
            <FieldRow label="expiry" value={d.expiry} />
            <FieldRow label="cvv" value={d.cvv} sensitive />
            {d.pin && <FieldRow label="pin" value={d.pin} sensitive />}
            <FieldRow label="notes" value={d.notes || ""} />
          </>
        );
      }
      case "identity": {
        const d = item.data as IdentityData;
        const name = [d.firstname, d.lastname].filter(Boolean).join(" ");
        const location = [d.city, d.state, d.zip, d.country].filter(Boolean).join(", ");
        return (
          <>
            {name && <FieldRow label="name" value={name} />}
            <FieldRow label="email" value={d.email || ""} />
            <FieldRow label="phone" value={d.phone || ""} />
            <FieldRow label="address" value={d.address || ""} />
            {location && <FieldRow label="location" value={location} />}
            <FieldRow label="notes" value={d.notes || ""} />
          </>
        );
      }
      case "ssh": {
        const d = item.data as SshData;
        return (
          <>
            <FieldRow label="private key" value={d.privatekey} sensitive />
            <FieldRow label="public key" value={d.publickey || ""} />
            <FieldRow label="passphrase" value={d.passphrase || ""} sensitive />
            <FieldRow label="notes" value={d.notes || ""} />
          </>
        );
      }
      case "api": {
        const d = item.data as ApiData;
        return (
          <>
            <FieldRow label="api key" value={d.key} sensitive />
            <FieldRow label="api secret" value={d.secret || ""} sensitive />
            <FieldRow label="endpoint" value={d.endpoint || ""} />
            <FieldRow label="notes" value={d.notes || ""} />
          </>
        );
      }
      case "otp": {
        const d = item.data as OtpData;
        return (
          <>
            <FieldRow label="code" value="" isTotp totpSecret={d.secret} />
            <FieldRow label="secret" value={d.secret} sensitive />
            <FieldRow label="issuer" value={d.issuer || ""} />
            <FieldRow label="account" value={d.account || ""} />
          </>
        );
      }
      case "passkey": {
        const d = item.data as PasskeyData;
        return (
          <>
            <FieldRow label="credential id" value={d.credentialid} />
            <FieldRow label="public key" value={d.publickey} />
            <FieldRow label="relying party" value={d.rpid} />
            <FieldRow label="origin" value={d.origin} />
            <FieldRow label="notes" value={d.notes || ""} />
          </>
        );
      }
      default:
        return null;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
          <XIcon size={22} color="rgba(255,255,255,0.5)" />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={handleFavorite} style={styles.headerButton} hitSlop={8}>
            {item.favorite ? <StarIcon size={20} /> : <StarOutlineIcon size={20} />}
          </Pressable>
          <Pressable onPress={onEdit} style={styles.headerButton} hitSlop={8}>
            <PencilIcon size={20} />
          </Pressable>
          <Pressable onPress={onDelete} style={styles.headerButton} hitSlop={8}>
            <TrashIcon size={20} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconLarge}>
            <TypeIcon type={item.type} size={32} color="#d4b08c" />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.type}>{typeLabels[item.type]}</Text>
          {item.tags.length > 0 && (
            <View style={styles.tags}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fields}>{renderFields()}</View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>created {new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.metaText}>updated {new Date(item.updatedAt).toLocaleDateString()}</Text>
        </View>
      </ScrollView>
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
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  iconLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(212,176,140,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    textTransform: "lowercase",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  fields: {
    padding: 16,
  },
  meta: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
});
