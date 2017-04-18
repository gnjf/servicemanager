import _ from 'lodash'
import manager from './manager'
import { A, B, C, D } from './services'

manager.registerServices(
  {
    name: 'a',
    klass: A,
    ttl: 5000,
    keep: 0
  },
  {
    name: 'b',
    klass: B,
    keep: 10
  },
  {
    name: 'c',
    klass: C
  },
  {
    name: 'd',
    klass: D
  }
)

const catchAll = manager.listenEvents('*', '*', '*', (action) => {
  // console.log('catchall', action.addr)
})

console.log('state', _.cloneDeep(manager.state))

console.log('doSomething first time')
manager.get('a').doSomething()

console.log('doSomething second time')
manager.get('a').doSomething()

console.log('state', _.cloneDeep(manager.state))
console.log('remove d-c-b-a')

manager.purge('d')
manager.purge('c')
manager.purge('b')
manager.purge('a')

console.log('state', _.cloneDeep(manager.state))
console.log('remove a-b-c-d')

manager.purge('a')
manager.purge('b')
manager.purge('c')
manager.purge('d')

console.log('state', _.cloneDeep(manager.state))
