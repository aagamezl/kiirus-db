import test from 'ava'

import router from './../src/Router'

test.beforeEach(t => {
  router.setRoutes({})
})

test.serial('should add get route', t => {
  const method = 'GET'
  const handler = (request, response) => {}
  const routes = {
    [method]: [{
      handler,
      params: [],
      path: /^\/route$/,
      method
    }]
  }

  router.get('/route', handler)

  t.deepEqual(router.getRoutes(), routes)
})

test.serial('should add post route', t => {
  const method = 'POST'
  const handler = (request, response) => {}
  const routes = {
    [method]: [{
      handler,
      params: [],
      path: /^\/route$/,
      method
    }]
  }

  // router.setRoutes({})

  router.post('/route', handler)

  t.deepEqual(router.getRoutes(), routes)
})