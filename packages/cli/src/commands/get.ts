import { getItem, resolveReference } from "../api.js";

const OP_REF_PATTERN = /^op:\/\/([^/]+)\/([^/]+)\/([^/]+)$/;

export async function get(id: string, options: { field?: string; json?: boolean }): Promise<void> {
  try {
    if (OP_REF_PATTERN.test(id)) {
      const value = await resolveReference(id);
      console.log(value);
      return;
    }

    const item = await getItem(id);

    if (options.json) {
      console.log(JSON.stringify(item, null, 2));
      return;
    }

    if (options.field) {
      const value = item.fields[options.field];
      if (value === undefined) {
        console.error("error: field not found:", options.field);
        process.exit(1);
      }
      console.log(value);
      return;
    }

    console.log("id:      " + item.id);
    console.log("name:    " + item.name);
    console.log("type:    " + item.type);
    console.log("vault:   " + item.vault);
    console.log("created: " + item.createdAt);
    console.log("updated: " + item.updatedAt);
    console.log("");
    console.log("fields:");
    for (const [key, value] of Object.entries(item.fields)) {
      const masked = key.toLowerCase().includes("password") ? "********" : value;
      console.log("  " + key + ": " + masked);
    }
  } catch (err) {
    console.error("error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
