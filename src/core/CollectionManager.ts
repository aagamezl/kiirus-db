import path from "node:path";
import { randomUUID } from "node:crypto";

import { SegmentWriter } from "./SegmentWriter";
import { SegmentReader } from "./SegmentReader";
import { EnvelopeSerializer } from "./EnvelopeSerializer";
import { ManifestManager, ManifestData } from "./ManifestManager";
import { IFilesystem, ILogger } from "../utils";

export class CollectionManager {
  private manifest: ManifestManager;
  private manifestData!: ManifestData;

  private writer!: SegmentWriter;
  private reader!: SegmentReader;

  constructor(
    private readonly fs: IFilesystem,
    private readonly logger: ILogger,
    private readonly baseDir: string,
    private readonly collectionName: string
  ) {
    const collectionDir = path.join(baseDir, collectionName);

    this.manifest = new ManifestManager({
      dir: collectionDir,
      logger: this.logger,
    });
  }

  async init(): Promise<void> {
    this.manifestData = await this.manifest.load();

    this.writer = new SegmentWriter(this.fs, {
      dir: path.join(this.baseDir, this.collectionName),
      segmentPrefix: this.collectionName,
      logger: this.logger,
      activeSegment: this.manifestData.active_segment
    });

    await this.writer.open();

    const currentSegment = this.writer.getCurrentSegmentName();

    // Make sure manifest knows the active segment
    if (!this.manifestData.active_segment && currentSegment) {
      await this.manifest.update({
        active_segment: currentSegment,
        segments: [currentSegment]
      });

      this.manifestData = this.manifest.get();
    }

    const segmentPath = path.join(
      this.baseDir,
      this.collectionName,
      this.manifestData.active_segment!
    );

    this.reader = new SegmentReader(segmentPath, this.fs, this.logger);
  }

  /**
   * INSERT — WAL + segment append
   */
  async insert(document: Record<string, any>): Promise<Record<string, any>> {
    if (typeof document !== "object" || Array.isArray(document)) {
      throw new Error("Document must be an object");
    }

    // 1. Prepare ID + RAW document
    const doc = {
      _id: document._id ?? randomUUID(),
      ...document,
      _createdAt: Date.now()
    };

    // 2. Get next seq from manifest
    const seq = await this.manifest.incrementSeq();

    // 3. Create WAL envelope
    const env = EnvelopeSerializer.create("insert", seq, doc, doc._id);
    const line = EnvelopeSerializer.toString(env);

    // 4. Append to segment
    const { path: segmentPath } = await this.writer.appendLine(line);

    // 5. Detect rotation → reflect in manifest
    const currentSegmentName = this.writer.getCurrentSegmentName();

    if (
      currentSegmentName &&
      currentSegmentName !== this.manifestData.active_segment
    ) {
      await this.manifest.update({
        active_segment: currentSegmentName,
        segments: [...this.manifestData.segments, currentSegmentName]
      });

      this.manifestData = this.manifest.get();
    }

    return doc;
  }

  async *findAll(): AsyncGenerator<Record<string, any>> {
    // yield* this.reader.readAll();

    // const materialized = new Map<string, any>();

    // for await (const record of this.reader.readAll()) {
    //   const { op, doc } = record;

    //   switch (op) {
    //     case 'insert':
    //     case 'update':
    //       materialized.set(doc._id, doc);
    //       break;

    //     case 'delete':
    //       materialized.delete(doc._id);
    //       break;
    //   }
    // }

    // return Array.from(materialized.values());

    for await (const record of this.reader.readDocuments()) {
      if (record.op === 'insert' || record.op === 'update') {
        yield record.doc;
      }
    }
  }

  async getAll(): Promise<Record<string, any>[]> {
    const out: Record<string, any>[] = [];

    for await (const row of this.findAll()) {
      out.push(row);
    }

    return out;
  }
}
