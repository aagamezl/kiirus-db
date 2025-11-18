import fs from "fs";
import path from "path";

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

import { CollectionManager } from "../src/core/CollectionManager";

const TMP_DIR = path.join(process.cwd(), "__tmp__");

beforeAll(() => fs.mkdirSync(TMP_DIR, { recursive: true }));
afterAll(() => fs.rmSync(TMP_DIR, { recursive: true, force: true }));

describe.skip("CollectionManager", () => {
  // const collectionName = "users";
  // const manager = new CollectionManager(TMP_DIR, collectionName);

  // test("inserts a document and persists metadata", async () => {
  //   const doc = await manager.insert({ name: "Alice", age: 29 });

  //   expect(doc._id).toBeDefined();
  //   expect(doc._createdAt).toBeDefined();

  //   const meta = JSON.parse(
  //     fs.readFileSync(path.join(TMP_DIR, collectionName, "metadata.json"), "utf-8")
  //   );
  //   expect(meta.documentCount).toBeGreaterThan(0);
  // });

  // test("inserts multiple documents and reads them back", async () => {
  //   await manager.insert({ name: "Bob", age: 31 });
  //   await manager.insert({ name: "Charlie", age: 25 });

  //   const docs = await manager.getAll();

  //   expect(docs.length).toBeGreaterThanOrEqual(3);
  //   expect(docs.some((d) => d.name === "Charlie")).toBe(true);
  // });

  // test("findAll yields documents lazily", async () => {
  //   const names: string[] = [];
  //   for await (const doc of manager.findAll()) {
  //     names.push(doc.name);
  //   }

  //   expect(names).toContain("Alice");
  //   expect(names).toContain("Bob");
  // });
});
