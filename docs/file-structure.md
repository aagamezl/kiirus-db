# File Structure

```
/src
  /core
    CollectionManager    # openCollection(name) -> Collection instance
    Collection            # insert/update/delete/upsert
    SegmentWriter         # append lines, rotation, fsync control
    ManifestManager       # read/write manifest
    SeqGenerator          # in-memory seq generator (persist on manifest)
    IDGenerator           # uuid or monotonic id provider
    Serializer            # envelope creation + crc
  /io
    FsAdapter             # thin wrapper around Node fs/promises for testability
    LockManager           # lease file or flock wrapper
  /recovery
    StartupScanner        # scan segments on startup & rebuild in-memory state
  /tools
    Compactor             # offline compaction process
  /types
    types.ts              # TS types: Envelope, Op, Manifest, SegmentMeta
```