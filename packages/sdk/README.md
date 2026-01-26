# @noro-sh/sdk

sdk for [noro](https://noro.sh) one-time secret sharing with end-to-end encryption.

## install

```bash
npm install @noro-sh/sdk
```

## quick start

```typescript
import Noro, { createkey } from "@noro-sh/sdk";

// create an api key (only needed once)
const { key: apikey } = await createkey();

// initialize client
const noro = new Noro({ apikey });

// share a secret (encrypts automatically)
const { url } = await noro.share("my secret data");
console.log(url); // https://noro.sh/abc123#encryptionkey

// send url to recipient...
```

## claiming secrets

```typescript
import Noro, { parseurl } from "@noro-sh/sdk";

const noro = new Noro({ apikey: "noro_..." });

// parse a noro url
const parsed = parseurl("https://noro.sh/abc123#key");
if (parsed) {
  const secret = await noro.claim(parsed.id, parsed.key);
  console.log(secret); // "my secret data"
}
```

## api

### `createkey(options?)`

create a new api key (no auth required).

```typescript
const { key, expires } = await createkey({
  webhook: "https://example.com/webhook", // optional
});
```

### `new Noro(config)`

create a client instance.

```typescript
const noro = new Noro({
  apikey: "noro_...",
  baseurl: "https://noro.sh/api/v1", // optional
});
```

### `noro.share(text, options?)`

share text with end-to-end encryption.

```typescript
const { id, url, key } = await noro.share("secret", {
  ttl: "1d",   // 1h, 6h, 12h, 1d, 7d
  views: 1,   // 1-5
});
```

### `noro.sharefile(data, options)`

share a file with encryption.

```typescript
const buffer = await fs.readFile("secret.pdf");
const { url } = await noro.sharefile(buffer, {
  filename: "secret.pdf",
  mimetype: "application/pdf",
  ttl: "1d",
  views: 1,
});
```

### `noro.claim(id, key)`

claim and decrypt a text secret.

```typescript
const text = await noro.claim("abc123", "encryptionkey");
```

### `noro.claimfile(id, key)`

claim and decrypt a file.

```typescript
const { data, filename, mimetype } = await noro.claimfile("abc123", "key");
await fs.writeFile(filename, data);
```

### `noro.claimraw(id)`

claim without decryption (for custom handling).

```typescript
const { data, type, remaining } = await noro.claimraw("abc123");
```

### `noro.revoke(id)`

delete a secret before it expires.

```typescript
await noro.revoke("abc123");
```

### `noro.key()`

get api key info.

```typescript
const { hint, webhook, created, expires } = await noro.key();
```

### `noro.updatekey(options)`

update webhook url.

```typescript
await noro.updatekey({ webhook: "https://new.url/hook" });
```

### `noro.deletekey()`

delete the api key.

```typescript
await noro.deletekey();
```

## utilities

### `parseurl(url)`

parse a noro url into id and key.

```typescript
import { parseurl } from "@noro-sh/sdk";

const result = parseurl("https://noro.sh/abc123#mykey");
// { id: "abc123", key: "mykey" }
```

### `encrypt(text, key)` / `decrypt(data, key)`

low-level encryption (AES-256-GCM).

```typescript
import { encrypt, decrypt, generatekey } from "@noro-sh/sdk";

const key = generatekey();
const encrypted = await encrypt("secret", key);
const decrypted = await decrypt(encrypted, key);
```

## error handling

```typescript
import { NoroError } from "@noro-sh/sdk";

try {
  await noro.claim("invalid", "key");
} catch (err) {
  if (err instanceof NoroError) {
    console.log(err.status);    // 404
    console.log(err.message);   // "not found"
    console.log(err.ratelimit); // { limit, remaining, reset }
  }
}
```

## links

- [noro.sh](https://noro.sh)
- [api docs](https://noro.sh/docs/api)
- [github](https://github.com/visible/noro)
