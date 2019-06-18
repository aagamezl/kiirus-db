# Client

The command signature is:

```json
{
  "command": "type-operation",
  "options": {...}
}
```

## Insert Command:

```json
{
  "command": "collection-insert",
  "options": {
    "database": "test-database",
    "collection": "users",
    "data": [...] | {...}
  }
}
```
