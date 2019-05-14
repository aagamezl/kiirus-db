// const router = require('./src/Router')
const storage = require('./src/Storage')

  /* const handler = () => {}

console.log(router.getRoutes())

router.delete('/users', handler)
router.get('/users', handler)
router.patch('/users', handler)
router.post('/users', handler)
router.put('/users', handler)
router.get('/users/:id', handler)
router.get('/users/favorites/:id', handler)

console.log(router.verifyRoute('/users', 'DELETE'))
console.log(router.verifyRoute('/users', 'GET'))
console.log(router.verifyRoute('/users', 'PATCH'))
console.log(router.verifyRoute('/users', 'POST'))
console.log(router.verifyRoute('/users', 'PUT'))
console.log(router.verifyRoute('/users/1', 'GET'))
console.log(router.verifyRoute('/users/favorites/1', 'GET'))
console.log(router.getRoutes())

router.setRoutes({})
console.log(router.getRoutes())

router.get('/route', handler)
router.get('/route/:id', handler)

console.log(router.verifyRoute('/route/10', 'GET')) */

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

// async function run () {
//   console.log(await storage.createDir('./foo/bar/bas', true, 0o777))
// }

// run()
