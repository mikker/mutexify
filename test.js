var test = require('brittle')
var mutexify = require('./')
var mutexifyPromise = require('./promise')

test('locks', function (t) {
  t.plan(21)

  var lock = mutexify()
  var used = false
  t.ok(!lock.locked, 'not locked')

  for (var i = 0; i < 10; i++) {
    lock(function (release) {
      t.ok(!used, 'one at the time')
      t.ok(lock.locked, 'locked')
      used = true
      setImmediate(function () {
        used = false
        release()
      })
    })
  }
})

test('calls callback', function (t) {
  t.plan(2)

  var lock = mutexify()

  var cb = function (err, value) {
    t.is(err, null)
    t.is(value, 'hello world')
  }

  lock(function (release) {
    release(cb, null, 'hello world')
  })
})

test('calls the locking callbacks in a different stack', function (t) {
  t.plan(2)

  var lock = mutexify()

  var topScopeFinished = false
  var secondScopeFinished = false

  lock(function (release) {
    t.ok(topScopeFinished, 'the test function has already finished running')
    release()
    secondScopeFinished = true
  })

  lock(function (release) {
    t.ok(secondScopeFinished, "the last lock's call stack is done")
    release()
  })

  topScopeFinished = true
})

test('locks with promises', async function (t) {
  t.plan(21)

  var lock = mutexifyPromise()
  var used = false
  t.ok(!lock.locked, 'not locked')
  for (var i = 0; i < 10; i++) {
    var release = await lock()
    t.ok(!used, 'one at the time')
    t.ok(lock.locked, 'locked')
    used = true
    setImmediate(function () {
      used = false
      release()
    })
  }
})
