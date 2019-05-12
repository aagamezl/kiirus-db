const router = require('./src/Router')

const handler = () => {}

console.log(router.getRoutes())

// router.delete('/users', handler)
// router.get('/users', handler)
// router.patch('/users', handler)
// router.post('/users', handler)
// router.put('/users', handler)
// router.get('/users/:id', handler)
// router.get('/users/favorites/:id', handler)

// console.log(router.verifyRoute('/users', 'DELETE'))
// console.log(router.verifyRoute('/users', 'GET'))
// console.log(router.verifyRoute('/users', 'PATCH'))
// console.log(router.verifyRoute('/users', 'POST'))
// console.log(router.verifyRoute('/users', 'PUT'))
// console.log(router.verifyRoute('/users/1', 'GET'))
// console.log(router.verifyRoute('/users/favorites/1', 'GET'))
// console.log(router.getRoutes())

// router.setRoutes({})
// console.log(router.getRoutes())

// router.get('/route', handler)
router.get('/route/:id', handler)

console.log(router.verifyRoute('/route/10', 'GET'))
