# Push

Share all variables from your .env file at once.

## Push .env

Share everything in your .env file with one command:

```bash
noro push
```

All variables are encrypted together into a single link.

## Source file

The CLI looks for these files in order:

1. `.env.local`
2. `.env`

## Set expiry

Control how long the shared env stays available:

```bash
noro push --ttl=1h
```

## Output

You get a summary of what was shared:

```bash
$ noro push

  noro.sh/x7k#key

  or: npx noro x7k#key
  expires: 1d
  variables: API_KEY, DATABASE_URL, SECRET_TOKEN
```
