# Share

Create one-time links for your environment variables.

## Single variable

Share a variable by name. The CLI reads from your environment or .env file:

```bash
noro share API_KEY
```

Outputs a link like `noro.sh/x7k#key`

## Multiple variables

Share several variables at once:

```bash
noro share API_KEY DATABASE_URL SECRET_TOKEN
```

All variables are bundled into a single encrypted link.

## Set expiry

Control how long the secret stays available:

```bash
noro share API_KEY --ttl=1h
```

Options:
- `1h` - 1 hour
- `6h` - 6 hours
- `12h` - 12 hours
- `1d` - 1 day (default)
- `7d` - 7 days

## Where values come from

The CLI checks these locations in order:

1. Environment variables
2. `.env.local` in current directory
3. `.env` in current directory
