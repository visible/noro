import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import {
  start,
  stop,
  isrunning,
  getsocketpath,
  addkey,
  removekey,
  listkeysdetailed,
  keyfingerprint,
  loadkeyfromfile,
  detectkeytype,
} from "../agent/index.js";
import { getItem, listItems } from "../api.js";

export async function agent(): Promise<void> {
  if (isrunning()) {
    console.error("error: agent already running");
    process.exit(1);
  }

  const path = await start({
    onapprovalrequest: async (keyid, sessionid) => {
      const rl = createInterface({ input: stdin, output: stdout });
      try {
        const answer = await rl.question(`approve signing for key ${keyid}? [y/N] `);
        return answer.toLowerCase() === "y";
      } finally {
        rl.close();
      }
    },
  });

  console.log(`SSH_AUTH_SOCK=${path}; export SSH_AUTH_SOCK;`);
  console.log(`echo agent started;`);

  process.on("SIGINT", async () => {
    await stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await stop();
    process.exit(0);
  });

  await new Promise(() => {});
}

export async function add(id: string, options: { file?: string; comment?: string; approval?: boolean; ttl?: string }): Promise<void> {
  if (options.file) {
    const success = loadkeyfromfile(options.file, id, options.comment || options.file);
    if (!success) {
      console.error("error: failed to load key from file");
      process.exit(1);
    }
    console.log(`added key from ${options.file}`);
    return;
  }

  try {
    const item = await getItem(id);
    if (item.type !== "ssh") {
      console.error("error: item is not an ssh key");
      process.exit(1);
    }

    const privatekey = item.fields.privatekey || item.fields.private_key || item.fields.key;
    if (!privatekey) {
      console.error("error: no private key found in item");
      process.exit(1);
    }

    const keytype = detectkeytype(privatekey);
    if (!keytype) {
      console.error("error: unsupported key type");
      process.exit(1);
    }

    const ttl = options.ttl ? parsettl(options.ttl) : undefined;
    const comment = options.comment || item.name;

    const success = addkey(id, privatekey, comment, {
      requireapproval: options.approval,
      ttl,
    });

    if (!success) {
      console.error("error: failed to add key");
      process.exit(1);
    }

    console.log(`added ${keytype} key: ${comment}`);
  } catch (err) {
    console.error(`error: ${err instanceof Error ? err.message : "failed to fetch key"}`);
    process.exit(1);
  }
}

export async function list(): Promise<void> {
  const keys = listkeysdetailed();

  if (keys.length === 0) {
    console.log("no keys loaded");
    return;
  }

  for (const key of keys) {
    const fingerprint = keyfingerprint(key.blob);
    const expires = key.expires ? ` (expires ${new Date(key.expires).toLocaleString()})` : "";
    const approval = key.requireapproval ? " [approval required]" : "";
    console.log(`${key.keytype} ${fingerprint} ${key.comment}${expires}${approval}`);
  }
}

export async function remove(id: string): Promise<void> {
  const success = removekey(id);
  if (!success) {
    console.error("error: key not found");
    process.exit(1);
  }
  console.log("removed key");
}

export function status(): void {
  const running = isrunning();
  const path = getsocketpath();
  console.log(`agent: ${running ? "running" : "stopped"}`);
  console.log(`socket: ${path}`);
}

function parsettl(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) {
    console.error("error: invalid ttl format (use: 30s, 5m, 1h, 1d)");
    process.exit(1);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return value * multipliers[unit];
}
