```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ◇  noro                                                    │
│                                                              │
│   one-time secret sharing for env vars                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```bash
> what is this?

  share env vars with one command
  secrets encrypted client-side with aes-256-gcm
  self-destructs after first claim

> share?

  noro share OPENAI_API_KEY
  → noro.sh/a8f3k2#key

> claim?

  npx noro a8f3k2#key
  → ✓ added OPENAI_API_KEY to .env

> features?

  ✓ end-to-end encryption (key never leaves your machine)
  ✓ one-time use (deleted after claim)
  ✓ no account required
  ✓ works with any env var
  ✓ cli + web interface

> how it works?

  1. cli encrypts your env var locally
  2. encrypted blob stored on server
  3. decryption key stays in url fragment (never sent to server)
  4. recipient decrypts client-side
  5. secret deleted after first claim

> install?

  npm i -g noro

> stack?

  next.js · upstash redis · aes-256-gcm

> license?

  mit
```
