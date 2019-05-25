# Client

The command signature is:

```
{
  command: "type-operation",
  options: {}
}
```

For example:

```
{
  "command": "collection-insert",
  "options": {
    "database": "test-database","collection": "users",
    "data": [...]
  }
}
```