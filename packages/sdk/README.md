# noro-sdk

sdk for [noro](https://noro.sh) one-time secret sharing.

## install

```bash
npm install noro-sdk
```

## usage

```typescript
import Noro, { createkey } from "noro-sdk";

// create an api key (only needed once)
const { key } = await createkey();

// initialize client
const noro = new Noro({ apikey: key });

// create a secret
const secret = await noro.create("my secret data", {
  ttl: "1d",
  views: 1,
});
console.log(secret.url); // https://noro.sh/abc123#key

// claim a secret
const claimed = await noro.claim("abc123");
console.log(claimed.data); // encrypted data

// revoke a secret
await noro.revoke("abc123");
```

## api

### `createkey(options?)`

create a new api key. no authentication required.

```typescript
const { key } = await createkey({
  webhook: "https://example.com/webhook", // optional
});
```

### `new Noro(options)`

create a client instance.

```typescript
const noro = new Noro({
  apikey: "noro_...",
  baseurl: "https://noro.sh/api/v1", // optional
});
```

### `noro.create(data, options?)`

create a one-time secret.

```typescript
const secret = await noro.create("secret data", {
  ttl: "1d",      // 1h, 6h, 12h, 1d, 7d
  views: 1,       // max views before expiry
  type: "text",   // text or file
  filename: "",   // for files
  mimetype: "",   // for files
});
```

### `noro.claim(id)`

claim a secret by id.

### `noro.revoke(id)`

revoke a secret before it expires.

### `noro.key()`

get current api key info.

### `noro.updatekey(options)`

update api key webhook url.

### `noro.deletekey()`

delete api key.

## links

- [noro.sh](https://noro.sh)
- [docs](https://noro.sh/docs/api)
- [github](https://github.com/visible/noro)
