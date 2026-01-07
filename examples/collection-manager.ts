import { CollectionManager } from "../src/core/CollectionManager";
import { Filesystem, Logger } from "../src/utils";

const fileSystem = new Filesystem();
const logger = new Logger();
const collectionManager = new CollectionManager(fileSystem, logger, "./database", "users");
await collectionManager.init();

const document = { name: "John Doe", employeeNumber: -1 }

// const DOCUMENT_COUNT = 10000;
// for (let i = 0; i < DOCUMENT_COUNT; i++) {
//   document.employeeNumber = i;

//   const doc = await collectionManager.insert(document);
//   // console.log(doc);
// }

// const docs = await collectionManager.getAll();
const docs = await collectionManager.findAll();

let count = 0;
for await (const doc of docs) {
  // console.log(doc);
  count++;
}
console.log(`Count: ${count}`);
