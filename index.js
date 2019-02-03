#!/usr/bin/env node

const { getParams } = require('./src/helpers/cli')

// const params = [
//   '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/node',
//   '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/kiirusdb',
//   '--enableEncryption',
//   'false',
//   '--kmipServerName',
//   'KMIP Server HostName',
//   '--kmipPort',
//   '3000',
//   '--kmipServerCAFile',
//   'ca.pem',
//   '--kmipClientCertificateFile',
//   'client.pem'
// ]

// const params = [
//   '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/node',
//   '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/kiirusdb',
//   '-p',
//   '3000',
//   '-S',
//   '--cert',
//   'path/to/cert.pem',
//   '-K',
//   'path/to/key.pem',
// ]

console.log(getParams(process.argv))
// console.log(getParams(params))