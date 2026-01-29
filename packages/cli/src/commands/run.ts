import { spawn } from "node:child_process";
import { resolveReference } from "../api.js";

const OP_REF_PATTERN = /op:\/\/[^/]+\/[^/]+\/[^\s"']+/g;

async function resolveEnvRefs(env: Record<string, string>): Promise<Record<string, string>> {
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const matches = value.match(OP_REF_PATTERN);

    if (!matches) {
      resolved[key] = value;
      continue;
    }

    let newValue = value;
    for (const ref of matches) {
      try {
        const secret = await resolveReference(ref);
        newValue = newValue.replace(ref, secret);
      } catch (err) {
        console.error("warning: failed to resolve " + ref);
      }
    }
    resolved[key] = newValue;
  }

  return resolved;
}

export async function run(command: string[]): Promise<void> {
  if (command.length === 0) {
    console.error("error: no command specified");
    process.exit(1);
  }

  try {
    const env = await resolveEnvRefs(process.env as Record<string, string>);

    const child = spawn(command[0], command.slice(1), {
      env,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", (err) => {
      console.error("error:", err.message);
      process.exit(1);
    });

    child.on("exit", (code) => {
      process.exit(code ?? 0);
    });
  } catch (err) {
    console.error("error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
