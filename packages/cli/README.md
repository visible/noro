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
  self-destructs after viewing

> install?

  npm i -g noro

> share?

  noro share OPENAI_API_KEY
  → noro.sh/a8f3k2#key

  noro share API_KEY DB_URL
  → share multiple vars

  noro push
  → share entire .env file

> claim?

  noro a8f3k2#key
  → ✓ added OPENAI_API_KEY to .env

> peek?

  noro peek a8f3k2#key
  → preview keys without claiming
  → requires --peek when sharing

> manage?

  noro list
  → show active secrets

  noro revoke abc123
  → delete a secret

> config?

  noro config
  → view defaults

  noro config ttl 7d
  → set default expiry

  noro config peek true
  → enable peek by default

> options?

  --ttl=1h     expiry (1h/6h/12h/1d/7d)
  --views=2    max views (1-5)
  --peek       enable preview

> scripting?

  noro abc#key --json
  → {"variables":[...],"remaining":0}

  noro peek abc#key --json
  → {"keys":[...],"remaining":2}

  noro abc#key --output=.env
  → save directly to file

> security?

  ✓ aes-256-gcm encryption
  ✓ key never leaves your machine
  ✓ server never sees plaintext
  ✓ deleted after viewing

> web interface?

  https://noro.sh

> ai agents?

  docs bundled at node_modules/noro/docs/
  cat node_modules/noro/docs/llms.txt
```

```
made with /
```
