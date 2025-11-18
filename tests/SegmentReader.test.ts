import path from "path";

import { mock } from "jest-mock-extended";

import { SegmentReader } from "../src/core/SegmentReader";
import { SegmentWriter } from "../src/core/SegmentWriter";
import { IFilesystem } from "../src/utils/Filesystem";
import { ILogger } from "../src/utils/Logger";

const TMP_DIR = path.join(process.cwd(), "__tmp__");

describe("SegmentReader", () => {
  const filePath = path.join(TMP_DIR, "test-0001.data");

  // beforeAll(async () => {
  //   fs.mkdirSync(TMP_DIR, { recursive: true })

  //   const fileSystem = mock<IFilesystem>();
  //   const logger = mock<ILogger>();
  //   const writer = new SegmentWriter(fileSystem, { dir: TMP_DIR, segmentPrefix: "test", logger });
  //   await writer.open();

  //   await writer.appendLine(JSON.stringify({ _id: "1", name: "Alice" }));
  //   await writer.appendLine(JSON.stringify({ _id: "2", name: "Bob" }));
  //   await writer.appendLine(JSON.stringify({ _id: "3", name: "Charlie" }));
  //   await writer.close();
  // });

  // afterAll(() => {
  //   fs.rmSync(TMP_DIR, { recursive: true, force: true })
  // });

  test("reads all documents", async () => {
    const docs: Record<string, unknown>[] = [];
    const fileSystem = mock<IFilesystem>();
    const logger = mock<ILogger>();

    const reader = new SegmentReader(
      path.join(TMP_DIR, "test-0001.data"),
      fileSystem,
      logger
    );

    for await (const doc of reader.readAll()) {
      docs.push(doc);
    }

    expect(docs).toHaveLength(3);
    expect(docs[0].name).toBe("Alice");
    expect(docs[1].name).toBe("Bob");
    expect(docs[2].name).toBe("Charlie");
  });

  //   test("reads a document by offset", async () => {
  //     const content = fs.readFileSync(filePath, "utf-8");
  //     const offset = content.indexOf('{"_id":"2"'); // find start of Bob's document

  //     const doc = await reader.readByOffset(offset);
  //     expect(doc).not.toBeNull();
  //     expect(doc?.name).toBe("Bob");
  //   });

  //   test("handles malformed JSON gracefully", async () => {
  //     fs.appendFileSync(filePath, "\n{bad json}\n");

  //     const docs: any[] = [];
  //     for await (const doc of reader.readAll()) docs.push(doc);

  //     expect(docs).toHaveLength(3); // same valid documents
  //   });
});
