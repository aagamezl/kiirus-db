import { rm, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

import { ManifestManager } from "../src/core/ManifestManager";

const TMP_DIR = path.join(process.cwd(), "__tmp__");

describe.skip("ManifestManager", () => {
  beforeEach(async () => {
    await rm(TMP_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(TMP_DIR, { recursive: true, force: true });
  });

  it("should create a new manifest if missing", async () => {
    const m = new ManifestManager({ dir: TMP_DIR });
    const data = await m.load();
    expect(data.last_seq).toBe(0);
  });

  it("should update manifest and persist atomically", async () => {
    const m = new ManifestManager({ dir: TMP_DIR });
    await m.load();
    await m.update({ last_seq: 5, segments: ["users-0001.data"] });

    const content = await readFile(path.join(TMP_DIR, "manifest.json"), "utf8");
    const parsed = JSON.parse(content);
    expect(parsed.last_seq).toBe(5);
    expect(parsed.segments).toContain("users-0001.data");
  });

  it("should increment sequence safely", async () => {
    const m = new ManifestManager({ dir: TMP_DIR });
    await m.load();
    const seq1 = await m.incrementSeq();
    const seq2 = await m.incrementSeq();
    expect(seq2).toBe(seq1 + 1);
  });
});
