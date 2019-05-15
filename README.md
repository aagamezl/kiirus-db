# kiirus-db
A document-oriented NoSQL database, written entirely in JavaScript..

This Database use simple files to store the records and directories to represent the databases and collections, so, the architecture is very simple and easy to backup.

The the records is stored using AES *(Ths feature is in the roadmap, but first I need to implement some optimizations)*, to ensure an adequate level of protection for the data.

# Todo

- [X] Write command line tool to manage the server.
- [X] No linter errors.
- [X] Implement nodemon.
- [X] Add an editor config file.
- [ ] Write test cases.
- [X] Create custom router for HTTP server.
- [X] Create a Storage module to manage the filesystem database operations.
- [X] Create a HTTP server to start the database and to receive requests.
- [ ] Create a HTTP client to connect the database server and to perform operations.
- [ ] Use HTTPS for client/server communication.
- [ ] Build a sintax parser to make crud operations.
- [ ] Implement database encryption.
- [ ] Benchmark the database performance.
