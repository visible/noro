import { randomBytes } from "node:crypto";

interface GenerateOptions {
  length?: string;
  numbers?: boolean;
  symbols?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
}

const CHARS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export async function generate(options: GenerateOptions): Promise<void> {
  const length = parseInt(options.length || "16", 10);

  if (isNaN(length) || length < 1 || length > 128) {
    console.error("error: length must be between 1 and 128");
    process.exit(1);
  }

  const hasFlags =
    options.numbers || options.symbols || options.uppercase || options.lowercase;

  let charset = "";

  if (hasFlags) {
    if (options.lowercase !== false) charset += CHARS.lowercase;
    if (options.uppercase !== false) charset += CHARS.uppercase;
    if (options.numbers) charset += CHARS.numbers;
    if (options.symbols) charset += CHARS.symbols;
  } else {
    charset = CHARS.lowercase + CHARS.uppercase + CHARS.numbers;
  }

  if (!charset) {
    charset = CHARS.lowercase + CHARS.uppercase + CHARS.numbers;
  }

  const bytes = randomBytes(length);
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }

  console.log(password);
}
