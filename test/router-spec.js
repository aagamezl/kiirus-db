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

  router.post('/route', handler)

  t.deepEqual(router.getRoutes(), routes)
})

test.serial('should add multiple routes', t => {
  const handler = (request, response) => {}
  const routes = {
    ['GET']: [{
      handler,
      params: [],
      path: /^\/route$/,
      method: 'GET'
    }, {
      handler,
      params: ['id'],
      path: /^\/route\/([A-Za-z0-9_-]+)$/,
      method: 'GET'
    }],
    ['DELETE']: [{
      handler,
      params: ['id'],
      path: /^\/route\/([A-Za-z0-9_-]+)$/,
      method: 'DELETE'
    }]
  }

  router.get('/route', handler)
  router.get('/route/:id', handler)
  router.delete('/route/:id', handler)

  t.deepEqual(router.getRoutes(), routes)
})

test.serial('should verify correct route', t => {
  const method = 'GET'
  const handler = (request, response) => {}
  const route = {
    handler,
    'params': {},
    'path': /^\/route$/,
    'method': 'GET',
    'query': {}
  }

  router.get('/route', handler)
  router.get('/route/:id', handler)

  // console.log(JSON.stringify(router.verifyRoute('/route', 'GET'), null, '  '));

  t.deepEqual(router.verifyRoute('/route', 'GET'), [route])
})

test.serial('should verify correct route with param', t => {
  const method = 'GET'
  const handler = (request, response) => {}
  const route = {
    handler,
    'params': {'id': '10'},
    'path': /^\/route\/([A-Za-z0-9_-]+)$/,
    'method': 'GET',
    'query': {}
  }

  router.get('/route', handler)
  router.get('/route/:id', handler)

  // console.log(JSON.stringify(router.verifyRoute('/route', 'GET'), null, '  '));

  t.deepEqual(router.verifyRoute('/route/10', 'GET'), [route])
})