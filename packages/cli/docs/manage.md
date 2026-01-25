# Manage

View and control your active secrets.

## List secrets

See all your active (unexpired, unclaimed) secrets:

```bash
noro list
```

Shows the secret ID, variables, and time remaining:

```bash
$ noro list

  active secrets:

  x7k  API_KEY, DATABASE_URL  expires in 23h
  m9p  SECRET_TOKEN           expires in 6d
```

## Revoke a secret

Delete a secret before it expires or gets claimed:

```bash
noro revoke x7k
```

The secret is immediately and permanently deleted.

## Local history

Your shared secrets are tracked locally in:

```
~/.noro/history.json
```

This only stores metadata (ID, variable names, expiry). The actual secret values are never stored locally after sharing.
