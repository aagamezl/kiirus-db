import test from 'ava';

import { getParams } from './../src/helpers/cli'

test('getParams default true', t => {
  const params = [
    '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/node',
    '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/kiirusdb',
    '--enableEncryption',
    '--kmipServerName',
    'KMIP Server HostName',
    '--kmipPort',
    '3000',
    '--kmipServerCAFile',
    'ca.pem',
    '--kmipClientCertificateFile',
    'client.pem'
  ]

  const result = {
    enableEncryption: true,
    kmipServerName: 'KMIP Server HostName',
    kmipPort: '3000',
    kmipServerCAFile: 'ca.pem',
    kmipClientCertificateFile: 'client.pem' 
  }

  t.deepEqual(getParams(params), result);
})

test('getParams false value', t => {
  const params = [
    '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/node',
    '/home/aagamezl/.nvm/versions/node/v10.13.0/bin/kiirusdb',
    '--enableEncryption',
    'false',
    '--kmipServerName',
    'KMIP Server HostName',
    '--kmipPort',
    '3000',
    '--kmipServerCAFile',
    'ca.pem',
    '--kmipClientCertificateFile',
    'client.pem'
  ]

  const result = {
    enableEncryption: false,
    kmipServerName: 'KMIP Server HostName',
    kmipPort: '3000',
    kmipServerCAFile: 'ca.pem',
    kmipClientCertificateFile: 'client.pem' 
  }

  t.deepEqual(getParams(params), result);
})
