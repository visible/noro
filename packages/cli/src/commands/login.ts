import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { setToken, clearConfig } from "../config.js";
import { validateToken } from "../api.js";

export async function login(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const token = await rl.question("api token: ");

    if (!token.trim()) {
      console.error("error: token required");
      process.exit(1);
    }

    setToken(token.trim());

    const valid = await validateToken();
    if (!valid) {
      clearConfig();
      console.error("error: invalid token");
      process.exit(1);
    }

    console.log("logged in");
  } finally {
    rl.close();
  }
}

export async function logout(): Promise<void> {
  clearConfig();
  console.log("logged out");
}
