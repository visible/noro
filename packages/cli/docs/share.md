# Share

Create one-time links for your environment variables.

## Basic usage

```bash
noro share API_KEY
```

Output:

```
  noro.sh/x7k#key

  API_KEY · 1d · 1 view
```

## Multiple variables

```bash
noro share API_KEY DATABASE_URL SECRET_TOKEN
```

## Options

### Expiry

```bash
noro share API_KEY --ttl=1h
```

- `1h` - 1 hour
- `6h` - 6 hours
- `12h` - 12 hours
- `1d` - 1 day (default)
- `7d` - 7 days

### Max views

```bash
noro share API_KEY --views=3
```

Allow 1-5 views before deletion. Default is 1.

### Enable peek

```bash
noro share API_KEY --peek
```

Lets recipients preview variable names without consuming a view.

## Where values come from

1. Environment variables
2. `.env.local` in current directory
3. `.env` in current directory
