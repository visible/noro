# noro

cli for noro.sh secret sharing

## install

```bash
npm install -g noro
```

## usage

```bash
# authenticate
noro login
noro logout

# list items
noro list
noro list --vault personal

# list vaults
noro vaults

# get item
noro get <id>
noro get <id> --field password
noro get <id> --json

# 1password-compatible references
noro get op://vault/item/field

# generate password
noro generate
noro generate --length 32
noro generate --numbers --symbols

# run command with secrets injected
DATABASE_URL="op://prod/db/url" noro run -- node server.js
```

## secret references

noro supports 1password-compatible secret references:

```
op://vault/item/field
```

use these in environment variables and noro will resolve them:

```bash
export API_KEY="op://work/api/key"
noro run -- ./deploy.sh
```
