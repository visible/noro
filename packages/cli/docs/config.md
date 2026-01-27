# Config

Set default options for sharing.

## View config

```bash
noro config
```

Output:

```
  config: ~/.noro/config.json

  ttl = 7d
  views = 2
```

## Set defaults

```bash
noro config ttl 7d
noro config views 2
noro config peek true
```

## Get single value

```bash
noro config ttl
```

## Unset value

```bash
noro config ttl unset
```

## Available keys

| Key | Values | Description |
|-----|--------|-------------|
| ttl | 1h/6h/12h/1d/7d | Default expiry |
| views | 1-5 | Default max views |
| peek | true/false | Default peek setting |
| api | url | Custom API endpoint |

## Config file

Stored at `~/.noro/config.json` (works on Mac, Linux, Windows).
