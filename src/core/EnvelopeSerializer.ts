import crypto from "node:crypto";

export type OperationType = "insert" | "update" | "delete";

export interface Envelope<T = any> {
  _id: string;
  op: OperationType;
  seq: number;
  ts: number;
  doc?: T;
  crc32: string;
}

export class EnvelopeSerializer {
  static create<T>(
    op: OperationType,
    seq: number,
    doc?: T,
    id?: string
  ): Envelope<T> {
    const _id = id ?? EnvelopeSerializer._generateId();
    const ts = Date.now();
    const payload: Omit<Envelope<T>, "crc32"> = { _id, op, seq, ts, doc };
    const crc32 = EnvelopeSerializer._crc32(JSON.stringify(payload));

    return { ...payload, crc32 };
  }

  static toString<T>(env: Envelope<T>): string {
    return JSON.stringify(env);
  }

  static parse(line: string): Envelope {
    const obj = JSON.parse(line);
    const crcExpected = obj.crc32;
    const copy = { ...obj };

    delete copy.crc32;

    const crcComputed = EnvelopeSerializer._crc32(JSON.stringify(copy));
    if (crcExpected !== crcComputed) {
      throw new Error("CRC32 mismatch — data corruption detected");
    }

    return obj;
  }

  private static _generateId(): string {
    return crypto.randomUUID();
  }

  private static _crc32(str: string): string {
    const buf = Buffer.from(str, "utf8");
    let crc = ~0;

    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ TABLE[(crc ^ buf[i]) & 0xff];
    }

    return ((~crc) >>> 0).toString(16);
  }
}

/* CRC32 lookup table (precomputed) */
const TABLE = (() => {
  let c;
  const table: number[] = [];

  for (let n = 0; n < 256; n++) {
    c = n;

    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[n] = c;
  }

  return table;
})();
