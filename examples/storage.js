const storage = require('../src/Storage')

;(async () => {
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
