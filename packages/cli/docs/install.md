# Install

Share secrets from your terminal. No account required.

## Run with npx

No installation required. Run directly with npx:

```bash
npx noro share API_KEY
```

## Global install

Install globally for faster access:

```bash
npm install -g noro
```

Then use without npx:

```bash
noro share API_KEY
```

## Quickstart

Share a secret and get a one-time link:

```bash
# share a single variable
noro share API_KEY

# share multiple variables
noro share API_KEY DATABASE_URL

# share your entire .env file
noro push
```

The recipient claims with the link. After viewing, it's permanently deleted.
