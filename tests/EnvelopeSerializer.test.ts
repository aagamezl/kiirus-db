// import { describe, it, expect } from "jest";
import { EnvelopeSerializer } from "../src/core/EnvelopeSerializer";

describe("EnvelopeSerializer", () => {
  it("should create a valid envelope with CRC", () => {
    const env = EnvelopeSerializer.create("insert", 1, { name: "Álvaro" });
    expect(env._id).toBeDefined();
    expect(env.crc32).toMatch(/^[a-f0-9]+$/);
  });

  it("should serialize and parse preserving integrity", () => {
    const env = EnvelopeSerializer.create("insert", 1, { key: "value" });
    const line = EnvelopeSerializer.toString(env);
    const parsed = EnvelopeSerializer.parse(line);
    expect(parsed._id).toBe(env._id);
    expect(parsed.crc32).toBe(env.crc32);
  });

  it("should detect CRC32 corruption", () => {
    const env = EnvelopeSerializer.create("insert", 1, { a: 1 });
    const line = EnvelopeSerializer.toString(env);
    const corrupted = line.replace("1", "9");
    expect(() => EnvelopeSerializer.parse(corrupted)).toThrow();
  });
});
