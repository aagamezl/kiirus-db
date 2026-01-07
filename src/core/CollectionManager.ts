import path from "node:path";
import { randomUUID } from "node:crypto";

import { SegmentWriter } from "./SegmentWriter";
import { SegmentReader, EnvelopeWithMeta } from "./SegmentReader";
import { EnvelopeSerializer } from "./EnvelopeSerializer";
import { ManifestManager, ManifestData } from "./ManifestManager";
import { IFilesystem, ILogger } from "../utils";

/**
 * Index entry stored in memory and on disk.
 * `offset` is a byte offset inside the segment file.
 * `segment` is the segment file name (basename).
 */
type IndexEntry = {
  segment: string;
  offset: number;
  seq: number;
  deleted: boolean;
};

export class CollectionManager {
  private manifest: ManifestManager;
  private manifestData!: ManifestData;

  private writer!: SegmentWriter;
  private reader?: SegmentReader; // used only for convenience on active segment
  private index: Map<string, IndexEntry> = new Map();
  private indexPath: string;
  private collectionDir: string;

  constructor(
    private readonly fs: IFilesystem,
    private readonly logger: ILogger,
    private readonly baseDir: string,
    private readonly collectionName: string
  ) {
    this.collectionDir = path.join(baseDir, collectionName);

    // Manifest manager sits in collection dir
    this.manifest = new ManifestManager({
      dir: this.collectionDir,
      logger: this.logger,
    });

    this.indexPath = path.join(
      this.collectionDir,
      `${this.collectionName}.index.json`
    );
  }

  /**
   * Initialize collection: load manifest, open writer, and load or rebuild index.
   */
  async init(): Promise<void> {
    // Ensure collection dir exists (manifest.persist will also create)
    try {
      await this.fs.access(this.collectionDir);
    } catch {
      this.fs.mkdirSync(this.collectionDir, { recursive: true });
    }

    this.manifestData = await this.manifest.load();

    // Initialize writer, telling it which active segment to open (if any)
    this.writer = new SegmentWriter(this.fs, {
      dir: this.collectionDir,
      segmentPrefix: this.collectionName,
      logger: this.logger,
      activeSegment: this.manifestData.active_segment,
    });

    await this.writer.open();

    const currentSegmentName = this.writer.getCurrentSegmentName();
    if (!this.manifestData.active_segment && currentSegmentName) {
      // First time — set active segment
      await this.manifest.update({
        active_segment: currentSegmentName,
        segments: [currentSegmentName],
      });
      this.manifestData = this.manifest.get();
    }

    // Load or rebuild index
    if (this.fs.existsSync(this.indexPath)) {
      try {
        const raw = this.fs.readFileSync(this.indexPath, "utf-8") as string;
        const parsed = JSON.parse(raw) as Record<string, IndexEntry>;
        this.index = new Map(Object.entries(parsed));
        this.logger.info(
          `Loaded index for ${this.collectionName}, entries=${this.index.size}`
        );
      } catch (err) {
        this.logger.warning("Failed to load index; rebuilding", err);
        await this.rebuildIndex();
      }
    } else {
      // No index persisted → rebuild by scanning segments in manifest order
      await this.rebuildIndex();
    }

    // Prepare reader for active segment (optional convenience usage)
    const active = this.manifestData.active_segment;
    if (active) {
      const activePath = path.join(this.collectionDir, active);
      this.reader = new SegmentReader(activePath, this.fs, this.logger);
    }
  }

  /**
   * Rebuild the index by scanning all segments in manifest order.
   * This reads each envelope and stores the latest offset+seq per _id.
   */
  private async rebuildIndex(): Promise<void> {
    this.index.clear();

    // manifestData.segments should be ordered oldest->newest
    for (const segName of this.manifestData.segments) {
      const segPath = path.join(this.collectionDir, segName);

      // Create a reader for that segment and iterate envelopes (with offsets)
      const reader = new SegmentReader(segPath, this.fs, this.logger);
      for await (const env of reader.readDocuments()) {
        // env includes offset, op, seq, doc, _id
        const id = (env as any)._id as string;
        if (!id) continue;

        if (env.op === "delete") {
          // mark deleted in index (seq updated)
          this.index.set(id, {
            segment: segName,
            offset: env.offset,
            seq: env.seq,
            deleted: true,
          });
        } else {
          // insert or update → store latest offset and seq
          this.index.set(id, {
            segment: segName,
            offset: env.offset,
            seq: env.seq,
            deleted: false,
          });
        }
      }
    }

    // Persist the rebuilt index
    await this.saveIndex();
    this.logger.info(`Rebuilt index for ${this.collectionName}, entries=${this.index.size}`);
  }

  /**
   * Persist index atomically to disk.
   */
  private async saveIndex(): Promise<void> {
    const tmp = `${this.indexPath}.tmp`;
    const payloadObj: Record<string, IndexEntry> = {};
    for (const [k, v] of this.index.entries()) {
      payloadObj[k] = v;
    }
    const payload = JSON.stringify(payloadObj);

    // write tmp then rename for atomicity
    this.fs.writeFileSync(tmp, payload);
    // rename (overwrite) atomically
    try {
      // Use fs.promises.rename would require exposing it in IFilesystem; reuse writeFileSync + rename via node fs if available
      // But in your IFilesystem we haven't exposed rename sync; use manifest.persist style: write tmp then rename via node:fs if exist
      // We'll use node:fs renameSync through IFilesystem by using writeFileSync + fs.promises.rename is not in interface.
      // Simpler: use require('node:fs').renameSync — but to keep types, call (fs as any).renameSync if available
      (this.fs as any).renameSync
        ? (this.fs as any).renameSync(tmp, this.indexPath)
        : await Promise.resolve().then(() => {
          // fallback: overwrite
          this.fs.writeFileSync(this.indexPath, payload);
          try {
            (this.fs as any).unlinkSync && (this.fs as any).unlinkSync(tmp);
          } catch { }
        });
    } catch (err) {
      // best-effort: write directly
      this.fs.writeFileSync(this.indexPath, payload);
    }
  }

  /**
   * Insert a document (WAL envelope appended). This updates the in-memory index and persists it.
   */
  async insert(document: Record<string, any>): Promise<Record<string, any>> {
    if (typeof document !== "object" || Array.isArray(document)) {
      throw new Error("Document must be an object");
    }

    const doc = {
      _id: (document as any)._id ?? randomUUID(),
      ...document,
      _createdAt: Date.now(),
    };

    const seq = await this.manifest.incrementSeq();

    // create envelope and line
    const env = EnvelopeSerializer.create("insert", seq, doc, doc._id);
    const line = EnvelopeSerializer.toString(env);

    // ensure writer open (it should be after init but safe)
    await this.writer.open();

    // append
    const { offset } = await this.writer.appendLine(line);

    // get current segment name
    const currentSegment = this.writer.getCurrentSegmentName();
    if (!currentSegment) {
      throw new Error("Segment writer did not report current segment");
    }

    // Update manifest if segment rotated (writer will rotate internally and change active segment)
    if (this.manifestData.active_segment !== currentSegment) {
      const updatedSegments = Array.from(new Set([...this.manifestData.segments, currentSegment]));
      await this.manifest.update({
        active_segment: currentSegment,
        segments: updatedSegments,
      });
      this.manifestData = this.manifest.get();
    }

    // Update in-memory index: store segment name + offset + seq
    this.index.set(doc._id, {
      segment: currentSegment,
      offset,
      seq,
      deleted: false,
    });

    // Persist index (sync to disk)
    await this.saveIndex();

    return doc;
  }

  /**
   * findAll behaves like MongoDB: returns the most-recent (materialized) document for each _id,
   * skipping deleted records. Memory-efficient: we iterate the index, and only read the required offsets.
   *
   * Implementation detail:
   * - Group index entries by segment, then for each segment open the file once and read each offset.
   * - This avoids loading all documents into memory and minimizes file descriptor churn.
   */
  async *findAll(): AsyncGenerator<Record<string, any>> {
    // Group by segment: Map<segment, Array<{id, offset}>>
    const groups = new Map<string, Array<{ id: string; offset: number }>>();

    for (const [id, entry] of this.index.entries()) {
      if (entry.deleted) continue; // skip deleted
      const arr = groups.get(entry.segment) ?? [];
      arr.push({ id, offset: entry.offset });
      groups.set(entry.segment, arr);
    }

    // For each segment, open file once and read all offsets
    for (const [segmentName, items] of groups.entries()) {
      const segPath = path.join(this.collectionDir, segmentName);

      // Open file handle once
      const fh = await this.fs.open(segPath, "r");
      try {
        // For performance, process offsets in increasing order (reading earlier offsets first)
        const sorted = items.slice().sort((a, b) => a.offset - b.offset);

        for (const it of sorted) {
          // readLineAtOffset using the open file handle (avoid reopening)
          const env = await this.readEnvelopeAtOffsetWithHandle(fh, it.offset);
          if (!env) continue;
          if (env.op === "delete") continue;
          if (!env.doc) continue;
          // yield raw document
          yield env.doc;
        }
      } finally {
        await fh.close();
      }
    }
  }

  /**
   * Helper: using an already-open FileHandle, read one line starting at offset and parse it as an Envelope.
   * This avoids reopening the file for each offset.
   */
  private async readEnvelopeAtOffsetWithHandle(fh: any, offset: number): Promise<EnvelopeWithMeta | null> {
    // Read chunks until newline
    const CHUNK = 4096;
    const buffer = Buffer.alloc(CHUNK);
    let bytesReadTotal = 0;
    let content = "";

    while (true) {
      const { bytesRead } = await fh.read(buffer, 0, CHUNK, offset + bytesReadTotal);
      if (bytesRead === 0) break;
      bytesReadTotal += bytesRead;
      const chunk = buffer.slice(0, bytesRead).toString("utf8");
      const idx = chunk.indexOf("\n");
      if (idx >= 0) {
        content += chunk.slice(0, idx);
        break;
      } else {
        content += chunk;
      }
      // safety guard if line very long — continue
    }

    const trimmed = content.trim();
    if (!trimmed) return null;

    try {
      const envelope = EnvelopeSerializer.parse(trimmed);
      // envelope lacks offset metadata; add it
      return {
        ...envelope,
        offset,
      } as EnvelopeWithMeta;
    } catch (err) {
      this.logger.warning(`Error parsing envelope at offset ${offset}: ${err}`);
      return null;
    }
  }

  /**
   * Convenience: return all documents as an array (not recommended for very large collections).
   */
  async getAll(): Promise<Record<string, any>[]> {
    const out: Record<string, any>[] = [];
    for await (const doc of this.findAll()) {
      out.push(doc);
    }
    return out;
  }
}
