import { ILogger } from "../utils/Logger";
import { IFilesystem } from "../utils/Filesystem";

interface EnvelopeRecord {
  op: 'insert' | 'update' | 'delete';
  doc: Record<string, any>;
}

export class SegmentReader {
  constructor(
    private readonly filePath: string,
    private readonly fileSystem: IFilesystem,
    private readonly logger: ILogger
  ) {}

  // async *readAll(): AsyncGenerator<Record<string, any>> {
  //   const stream = this.fileSystem.createReadStream(this.filePath, { encoding: "utf-8" });
  //   const rl = this.fileSystem.createInterface(stream);

  //   for await (const line of rl) {
  //     const trimmed = line.trim();

  //     if (!trimmed) {
  //       continue;
  //     }

  //     try {
  //       yield JSON.parse(trimmed);
  //     } catch (err) {
  //       this.logger.warning(`⚠️ Skipping malformed JSON line: ${trimmed}`);
  //     }
  //   }
  // }

  /**
 * Async generator returning raw JSON lines from the segment file.
 */
  async *readAllRaw(): AsyncGenerator<string> {
    // const rl = readline.createInterface({
    //   input: fs.createReadStream(this.filePath, { encoding: 'utf8' }),
    //   crlfDelay: Infinity,
    // });

    const rl = this.fileSystem.createInterface(
      this.fileSystem.createReadStream(this.filePath, { encoding: 'utf8' })
    );

    for await (const line of rl) {
      if (line.trim().length === 0) continue;
      yield line;
    }
  }

  /**
 * Async generator returning parsed envelope records:
 * { op: "insert" | "update" | "delete", doc: {...} }
 */
  async *readDocuments(): AsyncGenerator<EnvelopeRecord> {
    const rl = this.fileSystem.createInterface(
      this.fileSystem.createReadStream(this.filePath, { encoding: 'utf8' })
    );

    for await (const line of rl) {
      if (!line.trim()) continue;

      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch (err) {
        // You may later introduce a corruption handler
        continue;
      }

      yield parsed as EnvelopeRecord;
    }
  }

  async readByOffset(offset: number): Promise<Record<string, any> | null> {
    const handle = await this.fileSystem.open(this.filePath, "r");
    try {
      const buffer = Buffer.alloc(1024);
      let bytesRead = 0;
      let content = "";

      do {
        const { bytesRead: n } = await handle.read(buffer, 0, buffer.length, offset + bytesRead);
        if (n === 0) break;

        bytesRead += n;
        const chunk = buffer.slice(0, n).toString("utf-8");
        const newlineIndex = chunk.indexOf("\n");

        if (newlineIndex >= 0) {
          content += chunk.slice(0, newlineIndex);
          break;
        } else {
          content += chunk;
        }
      } while (true);

      const trimmed = content.trim();
      if (!trimmed) return null;

      return JSON.parse(trimmed);
    } catch (err) {
      this.logger.warning(`⚠️ Failed to read by offset ${offset}:`, err);
      return null;
    } finally {
      await handle.close();
    }
  }
}
