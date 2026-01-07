// import path from "node:path";

// console.log("running Index");

// import { Filesystem } from "./src/utils/Filesystem";
// import { SegmentWriter } from "./src/core/SegmentWriter";
// import { Logger } from "./src/utils/Logger";

// const TMP_DIR = path.join(process.cwd(), "__tmp__/segments");

// const fileSystem = new Filesystem();
// const logger = new Logger();
// const writer = new SegmentWriter(fileSystem, { dir: TMP_DIR, segmentPrefix: "users", logger });
// await writer.open();

// if (process.argv.includes("--clean")) {
//   console.log("cleaning");
//   await writer.clear();
// }

// // some comments

// /* await writer.appendLine(JSON.stringify({ _id: "1", op: "insert" }));
// await writer.appendLine(JSON.stringify({ _id: "2", op: "insert" })); */

// await writer.close();

// console.log("done");