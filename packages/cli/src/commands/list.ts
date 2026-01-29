import { listItems, listVaults } from "../api.js";

export async function list(options: { vault?: string }): Promise<void> {
  try {
    const items = await listItems(options.vault);

    if (items.length === 0) {
      console.log("no items found");
      return;
    }

    const maxName = Math.max(...items.map((i) => i.name.length), 4);
    const maxType = Math.max(...items.map((i) => i.type.length), 4);
    const maxVault = Math.max(...items.map((i) => i.vault.length), 5);

    console.log(
      "id".padEnd(24) +
        "  " +
        "name".padEnd(maxName) +
        "  " +
        "type".padEnd(maxType) +
        "  " +
        "vault".padEnd(maxVault)
    );
    console.log("-".repeat(24 + 2 + maxName + 2 + maxType + 2 + maxVault));

    for (const item of items) {
      console.log(
        item.id.slice(0, 24).padEnd(24) +
          "  " +
          item.name.padEnd(maxName) +
          "  " +
          item.type.padEnd(maxType) +
          "  " +
          item.vault.padEnd(maxVault)
      );
    }
  } catch (err) {
    console.error("error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

export async function vaults(): Promise<void> {
  try {
    const v = await listVaults();

    if (v.length === 0) {
      console.log("no vaults found");
      return;
    }

    const maxName = Math.max(...v.map((x) => x.name.length), 4);

    console.log("id".padEnd(24) + "  " + "name".padEnd(maxName));
    console.log("-".repeat(24 + 2 + maxName));

    for (const vault of v) {
      console.log(vault.id.slice(0, 24).padEnd(24) + "  " + vault.name.padEnd(maxName));
    }
  } catch (err) {
    console.error("error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
