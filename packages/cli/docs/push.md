# Push

Share all variables from your .env file at once.

## Basic usage

```bash
noro push
```

Output:

```
  noro.sh/x7k#key

  5 variables · 1d · 1 view
```

## Options

### Expiry

```bash
noro push --ttl=1h
```

### Max views

```bash
noro push --views=3
```

### Enable peek

```bash
noro push --peek
```

## Source file

The CLI looks for these files in order:

1. `.env.local`
2. `.env`
