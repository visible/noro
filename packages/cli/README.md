```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   / noro                                                     │
│                                                              │
│   share env vars with one command                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```bash
> what is this?

  cli tool for one-time secret sharing
  encrypt env vars locally, share via link
  self-destructs after first claim

> install?

  npm i -g noro

> share?

  noro share OPENAI_API_KEY
  → noro.sh/a8f3k2#key

  noro share API_KEY DB_URL --ttl=1h
  → share multiple vars

  noro push
  → share entire .env file

> claim?

  noro a8f3k2#key
  → ✓ added OPENAI_API_KEY to .env

> manage?

  noro list
  → show active secrets

  noro revoke abc123
  → delete a secret

> options?

  --ttl=1h    1 hour
  --ttl=6h    6 hours
  --ttl=12h   12 hours
  --ttl=1d    1 day (default)
  --ttl=7d    7 days

> security?

  ✓ aes-256-gcm encryption
  ✓ key never leaves your machine
  ✓ server never sees plaintext
  ✓ deleted after first claim

> web interface?

  https://noro.sh
  → share files, set view limits, no install needed

> license?

  mit

> ai agents?

  docs bundled at node_modules/noro/docs/
  grep -r "share" node_modules/noro/docs/
  cat node_modules/noro/docs/llms.txt
```
