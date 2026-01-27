# Claim

Retrieve shared secrets and save them locally.

## Basic usage

```bash
noro abc123#key
```

For single variables, automatically saves to your .env file:

```
✓ added API_KEY to .env
```

## Multiple variables

When claiming multiple variables, select which ones to save:

```
◆ select variables to save
│ ◼ API_KEY          sk-12****5678
│ ◼ DATABASE_URL     postgres****
│ ◻ DEBUG            true
└
```

Then choose where to save:

```
◆ save to
│ ○ .env (append)
│ ○ .env.local (append)
│ ○ new file...
│ ○ custom path...
│ ○ copy to clipboard
└
```

## Peek first

Preview variable names without claiming:

```bash
noro peek abc123#key
```

Output:

```
  API_KEY
  DATABASE_URL

  2/2 views remaining
```

Only works if sender used `--peek` flag.

## Scripting

Skip prompts with flags:

```bash
# json output
noro abc123#key --json

# key=value lines
noro abc123#key --stdout

# save to file
noro abc123#key --output=.env

# filter variables
noro abc123#key --vars=API_KEY,DB_URL

# combine
noro abc123#key --vars=API_KEY --output=.env
```

### JSON output

```bash
noro abc123#key --json
```

```json
{"variables":[{"name":"API_KEY","value":"sk-1234"}],"remaining":0}
```

### Peek JSON

```bash
noro peek abc123#key --json
```

```json
{"keys":["API_KEY","DB_URL"],"views":2,"remaining":2}
```
