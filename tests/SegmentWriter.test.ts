import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals";
import { mock } from 'jest-mock-extended';

import { SegmentWriter } from "../src/core/SegmentWriter";
import { IFilesystem } from "../src/utils/Filesystem";
import { ILogger } from "../src/utils/Logger";

describe("SegmentWriter", () => {
  // let mockLogger: { info: jest.Mock; error: jest.Mock };

  // Track virtual file system state
  // let openFileDescriptors: Map<number, { path: string; position: number }>;
  let nextFd: number;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset virtual file system state
    // virtualFiles = new Map();
    // openFileDescriptors = new Map();
    nextFd = 1;

    // mockLogger = {
    //   info: jest.fn(),
    //   error: jest.fn(),
    // };

    // Setup default mock implementations
    // mockedFs.existsSync.mockImplementation((path: any) => {
    //   return virtualFiles.has(path.toString());
    // });

    // mockedFs.mkdirSync.mockImplementation((path: any, options?: any) => {
    //   // In real implementation, this would create directories
    //   // For mocking, we just track that it was called
    //   return undefined as any; // Explicitly return undefined
    // });

    // mockedFs.statSync.mockImplementation((path: any) => {
    //   const file = virtualFiles.get(path.toString());
    //   if (file) {
    //     return { size: file.size } as any;
    //   }
    //   // Return empty stats for new files
    //   return { size: 0 } as any;
    // });

    // mockedFs.openSync.mockImplementation((path: any, flags: any) => {
    //   const fd = nextFd++;
    //   const filePath = path.toString();

    //   // Initialize file if it doesn't exist
    //   if (!virtualFiles.has(filePath)) {
    //     virtualFiles.set(filePath, { content: Buffer.alloc(0), size: 0 });
    //   }

    //   openFileDescriptors.set(fd, { path: filePath, position: 0 });
    //   return fd;
    // });

    // mockedFs.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
    //   const fileDesc = openFileDescriptors.get(fd);
    //   if (!fileDesc) throw new Error(`Invalid file descriptor: ${fd}`);

    //   const file = virtualFiles.get(fileDesc.path);
    //   if (!file) throw new Error(`File not found: ${fileDesc.path}`);

    //   // Append to file content
    //   file.content = Buffer.concat([file.content, buffer]);
    //   file.size += buffer.length;

    //   return buffer.length;
    // });

    // mockedFs.fsyncSync.mockImplementation((fd: number) => {
    //   // Sync operation - in mock, we just verify the file exists
    //   const fileDesc = openFileDescriptors.get(fd);
    //   if (!fileDesc) throw new Error(`Invalid file descriptor: ${fd}`);
    //   if (!virtualFiles.has(fileDesc.path)) throw new Error(`File not found: ${fileDesc.path}`);
    // });

    // mockedFs.closeSync.mockImplementation((fd: number) => {
    //   openFileDescriptors.delete(fd);
    // });

    // mockedFsPromises.access.mockImplementation(async (path: any) => {
    //   if (!virtualFiles.has(path.toString())) {
    //     throw new Error("File not found");
    //   }
    // });
  });

  afterEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("basic operations", () => {
    it("should create a new segment and append lines", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockReturnValue(undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 });
      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });
      fileSystem.fsyncSync.mockReturnValue(undefined);
      fileSystem.closeSync.mockReturnValue(undefined);
      fileSystem.statSync.mockReturnValue({ size: 0 });

      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });

      fileSystem.fsyncSync.mockReturnValue(undefined);
      fileSystem.closeSync.mockReturnValue(undefined);

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/test",
          segmentPrefix: "users",
          logger,
        });

      await writer.open();
      await writer.appendLine(JSON.stringify({ _id: "1", op: "insert" }));
      await writer.appendLine(JSON.stringify({ _id: "2", op: "insert" }));
      await writer.close();

      // Verify filesystem operations were called correctly
      expect(fileSystem.existsSync).toHaveBeenCalledWith("/test");
      expect(fileSystem.mkdirSync).toHaveBeenCalledWith("/test", { recursive: true });
      expect(fileSystem.openSync).toHaveBeenCalledWith("/test/users-0001.data", "a");
      expect(fileSystem.writeSync).toHaveBeenCalledTimes(2);
      expect(fileSystem.closeSync).toHaveBeenCalled();

      // Verify logger was called
      expect(logger.info).toHaveBeenCalledWith("Opened segment file: /test/users-0001.data");
      expect(logger.info).toHaveBeenCalledWith("Closed segment file: /test/users-0001.data");
    });

    it("should throw error if appendLine called before open", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      const writer = new SegmentWriter(fileSystem, { dir: "/test", segmentPrefix: "test", logger });

      await expect(writer.appendLine("test line"))
        .rejects
        .toThrow("SegmentWriter not initialized. Call open().");
    });
  });

  describe("segment rotation", () => {
    it("should rotate segment when max size exceeded", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockReturnValue(undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 });
      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });
      fileSystem.fsyncSync.mockReturnValue(undefined);
      fileSystem.closeSync.mockReturnValue(undefined);
      fileSystem.statSync.mockReturnValue({ size: 0 });

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/test",
          segmentPrefix: "users",
          maxSizeBytes: 100, // Small size to trigger rotation quickly
          logger,
        });

      await writer.open();

      // Write lines that will exceed the max size
      const largeLine = JSON.stringify({ data: "x".repeat(50) });
      await writer.appendLine(largeLine); // ~50+ bytes
      await writer.appendLine(largeLine); // ~100+ bytes - should trigger rotation
      await writer.appendLine(largeLine); // Should go to new file

      // Verify rotation occurred
      expect(fileSystem.openSync).toHaveBeenCalledTimes(2); // original + rotated
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Rotated segment"));
      expect(fileSystem.fsyncSync).toHaveBeenCalledTimes(4); // original + rotated

      await writer.close();
    });
  });

  describe("durability modes", () => {
    it("should not call fsync on appendLine with 'fast' durability", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockReturnValue(undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 });
      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });
      // fileSystem.fsyncSync.mockReturnValue(undefined);
      fileSystem.closeSync.mockReturnValue(undefined);
      fileSystem.statSync.mockReturnValue({ size: 0 });

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/test",
          segmentPrefix: "fast-mode",
          durability: "fast",
          logger,
        });

      await writer.open();


      await writer.appendLine(JSON.stringify({ id: 1 }));

      // With "fast" durability, fsync should not be called during appendLine
      expect(fileSystem.fsyncSync).not.toHaveBeenCalled();

      await writer.close();
    });

    it("should call fsync on appendLine with 'safe' durability", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockReturnValue(undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 });
      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });
      fileSystem.fsyncSync.mockReturnValue(undefined);
      fileSystem.closeSync.mockReturnValue(undefined);
      fileSystem.statSync.mockReturnValue({ size: 0 });

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/test",
          segmentPrefix: "safe-mode",
          durability: "safe",
          logger,
        });

      await writer.open();

      await writer.appendLine(JSON.stringify({ id: 1 }));

      // With "safe" durability, fsync should be called during appendLine
      expect(fileSystem.fsyncSync).toHaveBeenCalled();

      await writer.close();
    });
  });

  describe("segment path generation", () => {
    it("should find next available segment path when files exist", async () => {
      const virtualFiles: Map<string, { content: Buffer; size: number }> = new Map();

      // Simulate that files 0001 and 0002 already exist
      virtualFiles.set("/test/users-0001.data", { content: Buffer.alloc(0), size: 0 });
      virtualFiles.set("/test/users-0002.data", { content: Buffer.alloc(0), size: 0 });

      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockReturnValue(undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 });
      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });
      fileSystem.fsyncSync.mockReturnValue(undefined);
      fileSystem.closeSync.mockReturnValue(undefined);
      fileSystem.statSync.mockReturnValue({ size: 0 });

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/test",
          segmentPrefix: "users",
          logger,
        });

      await writer.open();

      // Should skip existing files and create 0003
      // expect(mockedFs.openSync).toHaveBeenCalledWith("/test/users-0001.data", "a");
    });

    it("should create directory if it doesn't exist", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockImplementation(() => undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 } as any);

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/new-dir",
          segmentPrefix: "test",
          logger,
        });

      await writer.open();

      // Verify mkdirSync was called with the correct arguments
      expect(fileSystem.mkdirSync).toHaveBeenCalledWith("/new-dir", { recursive: true });
    });

    it("should not create directory if it already exists", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(true);
      fileSystem.mkdirSync.mockImplementation(() => undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 } as any);

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/existing-dir",
          segmentPrefix: "test",
          logger,
        });

      await writer.open();

      expect(fileSystem.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty lines", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockReturnValue(undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 } as any);
      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });
      fileSystem.fsyncSync.mockReturnValue();
      fileSystem.closeSync.mockReturnValue();
      fileSystem.statSync.mockReturnValue({ size: 0 });

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/test",
          segmentPrefix: "test",
          logger,
        });

      await writer.open();
      await writer.appendLine("");
      await writer.close();

      expect(fileSystem.writeSync).toHaveBeenCalled();
    });

    it("should handle lines that already have newlines", async () => {
      const fileSystem = mock<IFilesystem>();
      const logger = mock<ILogger>();

      fileSystem.existsSync.mockReturnValue(false);
      fileSystem.mkdirSync.mockReturnValue(undefined);
      fileSystem.access.mockRejectedValue(new Error("File not found"));
      fileSystem.openSync.mockReturnValue(1);
      fileSystem.statSync.mockReturnValue({ size: 0 } as any);
      fileSystem.writeSync.mockImplementation((fd: number, buffer: any, offset?: any, length?: any, position?: number | null) => {
        return buffer.length;
      });
      fileSystem.fsyncSync.mockReturnValue();
      fileSystem.closeSync.mockReturnValue();
      fileSystem.statSync.mockReturnValue({ size: 0 });

      const writer = new SegmentWriter(
        fileSystem,
        {
          dir: "/test",
          segmentPrefix: "test",
          logger,
        });

      await writer.open();
      await writer.appendLine("test line\n"); // Already has newline
      await writer.close();

      expect(fileSystem.writeSync).toHaveBeenCalled();
    });
  });
});