import { promises as fs } from "node:fs";
import path from "node:path";

export interface ManifestData {
  segments: string[];
  last_seq: number;
  active_segment: string | null;
  created_at: number;
  updated_at: number;
}

export interface ManifestManagerOptions {
  dir: string;
  manifestName?: string; // defaults to manifest.json
  logger?: { info(msg: string): void; error(msg: string): void };
}

export class ManifestManager {
  private readonly manifestPath: string;
  private readonly tmpPath: string;
  private data: ManifestData;

  constructor(private opts: ManifestManagerOptions) {
    this.manifestPath = path.join(opts.dir, opts.manifestName ?? "manifest.json");
    this.tmpPath = this.manifestPath + ".tmp";
    this.data = {
      segments: [],
      last_seq: 0,
      active_segment: null,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
  }

  /** Load existing manifest, or initialize new one if missing */
  async load(): Promise<ManifestData> {
    try {
      const content = await fs.readFile(this.manifestPath, "utf8");

      this.data = JSON.parse(content);
      this.opts.logger?.info(`Loaded manifest from ${this.manifestPath}`);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        this.opts.logger?.info("Manifest not found; creating new");

        await this.persist();
      } else {
        this.opts.logger?.error(`Manifest read error: ${err.message}`);

        throw err;
      }
    }

    return this.data;
  }

  /** Returns current manifest state (in memory) */
  get(): ManifestData {
    return { ...this.data };
  }

  /** Update fields and persist atomically */
  async update(patch: Partial<ManifestData>): Promise<void> {
    this.data = {
      ...this.data,
      ...patch,
      updated_at: Date.now(),
    };

    await this.persist();
  }

  /** Persist manifest atomically (write temp then rename) */
  private async persist(): Promise<void> {
    const payload = JSON.stringify(this.data, null, 0);

    await fs.mkdir(this.opts.dir, { recursive: true });
    await fs.writeFile(this.tmpPath, payload);
    await fs.rename(this.tmpPath, this.manifestPath);
  }

  /** Increment sequence safely */
  async incrementSeq(): Promise<number> {
    this.data.last_seq += 1;

    await this.persist();

    return this.data.last_seq;
  }
}
