# Claim

Retrieve shared secrets and save them locally.

## Claim a secret

Use the code and key from the shared link:

```bash
noro x7k#key
```

The secret is decrypted locally and permanently deleted from the server.

## Interactive picker

When claiming multiple variables, choose which ones to save:

```
◆ select variables to save
│ ◼ API_KEY          sk-12****5678
│ ◼ DATABASE_URL     postgres****
│ ◻ DEBUG            true
└
```

Use arrow keys to navigate, space to toggle, enter to confirm.

## Choose destination

Select where to save the variables:

```
◆ save to
│ ○ .env (append)
│ ○ .env.local (append)
│ ○ new file...
│ ○ custom path...
│ ○ copy to clipboard
└
```

Existing variables are updated, new ones are appended.

## Automatic mode

For single variables, the CLI automatically saves to your .env file:

```bash
$ noro x7k#key
✓ added API_KEY to .env
```

If no .env file exists, the value is copied to clipboard instead.
