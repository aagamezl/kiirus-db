import {
  closeSync,
  createReadStream,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  ReadStream,
  statSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { access, open, FileHandle } from "node:fs/promises";
import { createInterface, Interface } from "node:readline";

export interface IFilesystem {
  access(path: string): Promise<void>;
  closeSync(fd: number): void;
  createInterface(stream: ReadStream): Interface;
  createReadStream(path: string, options?: { encoding?: BufferEncoding; flags?: string; signal?: AbortSignal }): ReadStream;
  existsSync(path: string): boolean;
  fsyncSync(fd: number): void;
  mkdirSync(path: string, options: { recursive: boolean }): string | undefined;
  open(path: string, flags: string): Promise<FileHandle>
  openSync(path: string, flags: string): number;
  readFileSync(path: string, encoding?: BufferEncoding): string | Buffer;
  statSync(path: string): { size: number };
  writeFileSync(path: string, data: string): void;
  writeSync(fd: number, buffer: Buffer, offset?: number | null, length?: number | null, position?: number | null): number;
}

export class Filesystem implements IFilesystem {
  access(path: string): Promise<void> {
    return access(path);
  }

  closeSync(fd: number): void {
    return closeSync(fd);
  }

  createInterface(stream: ReadStream): Interface {
    return createInterface({ input: stream, crlfDelay: Infinity })
  }

  createReadStream(path: string, options?: { encoding?: BufferEncoding; flags?: string; signal?: AbortSignal }): ReadStream {
    return createReadStream(path, options);
  }

  existsSync(path: string): boolean {
    return existsSync(path);
  }

  fsyncSync(fd: number): void {
    return fsyncSync(fd);
  }

  mkdirSync(path: string, options: { recursive: boolean }): string | undefined {
    return mkdirSync(path, options);
  }

  open(path: string, flags: string): Promise<FileHandle> {
    return open(path, flags);
  }

  openSync(path: string, flags: string): number {
    return openSync(path, flags);
  }

  readFileSync(path: string, encoding?: BufferEncoding): string | Buffer {
    return readFileSync(path, encoding);
  }

  statSync(path: string): { size: number } {
    return statSync(path);
  }

  writeFileSync(path: string, data: string): void {
    return writeFileSync(path, data);
  }

  writeSync(fd: number, buffer: Buffer, offset?: number | null, length?: number | null, position?: number | null): number {
    return writeSync(fd, buffer, offset, length, position);
  }
}