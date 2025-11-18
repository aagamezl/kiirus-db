// segment/SegmentWriter.ts
import path from "node:path";
import { IFilesystem } from "../utils/Filesystem";
import { ILogger } from "../utils/Logger";

export type DurabilityMode = "fast" | "safe" | "strong";

export interface SegmentWriterOptions {
  dir: string;
  segmentPrefix: string;
  logger: ILogger;
  maxSizeBytes?: number;
  durability?: DurabilityMode;
  activeSegment?: string | null;   // <-- NEW
}

// const DEFAULT_MAX_SIZE = 64 * 1024 * 1024; // 64MB
const DEFAULT_MAX_SIZE = 1 * 1024 * 1024;  // 1MB
const DEFAULT_DURABILITY: DurabilityMode = "safe";

export class SegmentWriter {
  private fd: number | null = null;
  private filePath: string | null = null;
  private bytesWritten = 0;
  private segmentIndex = 1;

  constructor(
    private readonly fileSystem: IFilesystem,
    private readonly opts: SegmentWriterOptions
  ) {
    this.opts.maxSizeBytes = opts.maxSizeBytes ?? DEFAULT_MAX_SIZE;
    this.opts.durability = opts.durability ?? DEFAULT_DURABILITY;
  }

  /**
   * Opens the currently active segment if provided.
   * Otherwise creates the first missing segment.
   */
  async open(): Promise<void> {
    if (!this.fileSystem.existsSync(this.opts.dir)) {
      this.fileSystem.mkdirSync(this.opts.dir, { recursive: true });
    }

    // 1. If activeSegment exists, open it
    if (this.opts.activeSegment) {
      this.filePath = path.join(this.opts.dir, this.opts.activeSegment);
      this.fd = this.fileSystem.openSync(this.filePath, "a");

      const stats = this.fileSystem.statSync(this.filePath);
      this.bytesWritten = stats.size;

      this.opts.logger.info(`Opened existing segment: ${this.filePath}`);
      return;
    }

    // 2. Otherwise create next available segment file
    this.filePath = await this._getNextSegmentPath();
    this.fd = this.fileSystem.openSync(this.filePath, "a");

    const stats = this.fileSystem.statSync(this.filePath);
    this.bytesWritten = stats.size;

    this.opts.logger.info(`Opened new segment: ${this.filePath}`);
  }

  /** Append one envelope line; rotate if exceeding size */
  async appendLine(line: string): Promise<{ offset: number; path: string }> {
    if (!this.fd || !this.filePath) {
      throw new Error("SegmentWriter not initialized. Call open() first.");
    }

    const entry = line.endsWith("\n") ? line : line + "\n";
    const bytes = Buffer.byteLength(entry);
    const offset = this.bytesWritten;

    const buffer = Buffer.from(entry, "utf8");
    this.fileSystem.writeSync(this.fd, buffer, 0, bytes, null);

    this.bytesWritten += bytes;

    if (this.opts.durability !== "fast") {
      this.fileSystem.fsyncSync(this.fd);
    }

    // Post-write rotation check
    if (this.bytesWritten >= this.opts.maxSizeBytes!) {
      await this.rotate();
    }

    return { offset, path: this.filePath };
  }

  /** Close file descriptor */
  async close(): Promise<void> {
    if (!this.fd) return;

    this.fileSystem.fsyncSync(this.fd);
    this.fileSystem.closeSync(this.fd);

    this.opts.logger.info(`Closed segment: ${this.filePath}`);

    this.fd = null;
    this.filePath = null;
  }

  /** Create new segment file */
  private async rotate(): Promise<void> {
    if (!this.fd || !this.filePath) return;

    this.opts.logger.info(`Rotating segment: ${this.filePath}`);

    this.fileSystem.fsyncSync(this.fd);
    this.fileSystem.closeSync(this.fd);

    this.segmentIndex++;

    const next = await this._getNextSegmentPath();
    this.filePath = next;
    this.fd = this.fileSystem.openSync(next, "a");
    this.bytesWritten = 0;

    this.opts.logger.info(`Opened new rotated segment: ${next}`);
  }

  private async _getNextSegmentPath(): Promise<string> {
    let idx = this.segmentIndex;

    while (true) {
      const fileName = `${this.opts.segmentPrefix}-${String(idx).padStart(4, "0")}.data`;
      const fullPath = path.join(this.opts.dir, fileName);

      try {
        await this.fileSystem.access(fullPath);
        idx++;
        continue;
      } catch {
        this.segmentIndex = idx;
        return fullPath;
      }
    }
  }

  getCurrentSegmentName(): string | null {
    return this.filePath ? path.basename(this.filePath) : null;
  }
}


console.log("running SegmentWriter")