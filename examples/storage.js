const { storage } = require('../src/support')

;(async () => {
  // write to a file that don't exists
  const filename = './data/db/test-database/users/ba1d1bf04095fb5cffce64e0b4ce5fa780e7f8fe.json'
  storage.writeFile(filename, 'foo file content').then((result) => {
    console.log(result)
  })

  console.log(await storage.createDir('./foo/bar/bas', true, 0o777))

  storage.writeFile('./foo/foo.txt', 'foo file content').then((result) => {
    console.log(result)
  })

  console.log('File content %s:', await storage.readFile('./foo/foo.txt'))

  const jsonContent = {
    'menu': {
      'id': 1,
      'value': 'File',
      'popup': {
        'menuitem': [
          { 'value': 'New', 'onclick': 'CreateNewDoc()' },
          { 'value': 'Open', 'onclick': 'OpenDoc()' },
          { 'value': 'Close', 'onclick': 'CloseDoc()' }
        ]
      }
    }
  }

  console.log(await storage.writeJson('./foo/bar/bar.json', jsonContent))
  console.log('File content %s:', JSON.stringify(await storage.readJson('./foo/bar/bar.json'), null, '  '))

  console.log(await storage.deleteFile('./foo/foo.txt'))

  console.log(await storage.deleteDir('./foo'))
})()
