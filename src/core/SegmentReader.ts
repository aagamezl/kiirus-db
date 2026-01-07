import { ILogger } from "../utils/Logger";
import { IFilesystem } from "../utils/Filesystem";
import { EnvelopeSerializer, Envelope } from "../core/EnvelopeSerializer";

/**
 * Envelope plus metadata returned by readDocuments()
 */
export type EnvelopeWithMeta<T = any> = Envelope<T> & {
  offset: number; // byte offset inside the segment file where this envelope starts
};

export class SegmentReader {
  constructor(
    private readonly filePath: string,
    private readonly fileSystem: IFilesystem,
    private readonly logger: ILogger
  ) { }

  /**
   * Read the raw lines from the segment file, yielding { line, offset }.
   * This implementation uses the low-level file handle and reads chunks, tracking byte offsets.
   */
  async *readAllRaw(): AsyncGenerator<{ line: string; offset: number }> {
    // Open file handle for reading
    const fh = await this.fileSystem.open(this.filePath, "r");
    try {
      const CHUNK = 64 * 1024; // 64KB chunk
      let filePos = 0; // next position to read from file
      let leftover = ""; // incomplete line carried between chunks

      const buffer = Buffer.alloc(CHUNK);

      while (true) {
        const { bytesRead } = await fh.read(buffer, 0, CHUNK, filePos);
        if (bytesRead === 0) {
          // EOF — yield leftover if non-empty
          if (leftover.length > 0) {
            const line = leftover;
            const offsetOfLine = filePos - Buffer.byteLength(leftover, "utf8");
            if (line.trim().length > 0) {
              yield { line, offset: offsetOfLine };
            }
            leftover = "";
          }
          break;
        }

        // Advance filePos
        filePos += bytesRead;

        const chunkStr = buffer.slice(0, bytesRead).toString("utf8");
        const combined = leftover + chunkStr;
        // Split into lines, keep trailing incomplete part as leftover
        const parts = combined.split("\n");
        // all except last are complete lines
        for (let i = 0; i < parts.length - 1; i++) {
          const line = parts[i];
          // Compute offset: need to find start offset of this line.
          // We can compute by subtracting length of bytes left in buffer after this line from filePos.
          // Simpler approach: maintain a running pointer to compute offsets of yielded lines.
          // We'll compute offsets by tracking totalBytesProcessed variable.

          // We'll implement offsets using a slightly different approach:
          // Maintain a running variable `cursor` that points to the start offset of `combined` before splitting.
          // But we don't have cursor here; so we refactor below to compute offsets correctly.
        }

        // To produce accurate offsets, we will process differently:
        break;
      }

      // Re-open logic: it's simpler to read sequentially using a second approach (below)
    } finally {
      await fh.close();
    }

    // Fallback: if the above streaming approach wasn't used, use a simpler approach:
    // NOTE: The earlier chunk-based implementation failed to compute offsets in the loop.
    // We'll implement a simpler loop reading byte-by-byte line detection while tracking offsets.
    // Re-open the file
    const fh2 = await this.fileSystem.open(this.filePath, "r");
    try {
      const READ_CHUNK = 64 * 1024;
      let pos = 0;
      let carry = "";

      while (true) {
        const buf = Buffer.alloc(READ_CHUNK);
        const { bytesRead } = await fh2.read(buf, 0, READ_CHUNK, pos);
        if (bytesRead === 0) {
          if (carry.length > 0) {
            const line = carry;
            const offsetOfLine = pos - Buffer.byteLength(carry, "utf8");
            if (line.trim().length > 0) {
              yield { line, offset: offsetOfLine };
            }
            carry = "";
          }
          break;
        }

        const chunk = buf.slice(0, bytesRead).toString("utf8");
        let startIndex = 0;
        for (let i = 0; i < chunk.length; i++) {
          if (chunk[i] === "\n") {
            const part = carry + chunk.slice(startIndex, i);
            const byteLenBeforeChunk = pos; // file position when this chunk started
            // offset = byteLenBeforeChunk - byteLength(carry) + byteLength of chunk slice before startIndex
            const offset =
              byteLenBeforeChunk -
              Buffer.byteLength(carry, "utf8") +
              Buffer.byteLength(chunk.slice(0, startIndex), "utf8");
            if (part.trim().length > 0) yield { line: part, offset };
            carry = "";
            startIndex = i + 1;
          }
        }

        // remaining tail after last newline
        carry += chunk.slice(startIndex);
        pos += bytesRead;
      }
    } finally {
      await fh2.close();
    }
  }

  /**
   * Parse the raw lines into envelopes and yield EnvelopeWithMeta { envelope fields + offset }.
   * This will validate CRC32 via EnvelopeSerializer.parse and skip malformed lines.
   */
  async *readDocuments(): AsyncGenerator<EnvelopeWithMeta> {
    for await (const { line, offset } of this.readAllRaw()) {
      if (!line || !line.trim()) continue;
      try {
        const parsed = EnvelopeSerializer.parse(line);
        // attach offset for metadata
        yield {
          ...parsed,
          offset,
        } as EnvelopeWithMeta;
      } catch (err) {
        this.logger.warning(`Skipping corrupted/malformed envelope at offset ${offset}: ${err}`);
        continue;
      }
    }
  }

  /**
   * Read a single envelope at offset; returns parsed envelope or null.
   */
  async readByOffset(offset: number): Promise<EnvelopeWithMeta | null> {
    const fh = await this.fileSystem.open(this.filePath, "r");
    try {
      const BUF = 4096;
      const buffer = Buffer.alloc(BUF);
      let bytesReadTotal = 0;
      let content = "";

      while (true) {
        const { bytesRead } = await fh.read(buffer, 0, BUF, offset + bytesReadTotal);
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
      }

      const trimmed = content.trim();
      if (!trimmed) return null;

      try {
        const env = EnvelopeSerializer.parse(trimmed);
        return {
          ...env,
          offset,
        } as EnvelopeWithMeta;
      } catch (err) {
        this.logger.warning(`Failed to parse envelope at offset ${offset}: ${err}`);
        return null;
      }
    } catch (err) {
      this.logger.warning(`Failed to read by offset ${offset}: ${err}`);
      return null;
    } finally {
      await fh.close();
    }
  }
}
