import _ from 'lodash'
import xs from 'xstream'

class Manager {
  constructor () {
    this.services = {}
    this.options = {}
    this.state = {}
    this.events$ = xs.create()

    setTimeout(() => {
      console.log('garbage collection')

      _.forEach(this.state, (service, name) => {
        let inst = _.chain(service)
              .values()
              .sortBy((instance) => {
                return instance.m.ts
              })
              .reverse()
              .value()

        inst = _.take(inst, inst.length - this.options[name].keep)

        _.forEach(inst, (instance) => {
          if (instance.m.ttl > 0) {
            if (Date.now() > (instance.m.ts + instance.m.ttl)) {
              this.purge(name, instance.m.getCaller().id)
            }
          }
        })
      })
    }, 10000)
  }

  registerServices (...services) {
    _.forEach(services, ({name, klass, ttl, keep}) => {
      this.services[name] = klass
      this.options[name] = {
        ttl: _.isNumber(ttl) ? ttl : 0,
        keep: _.isNumber(keep) ? keep : 1
      }
    })
  }

  get (name, id = null) {
    if (!_.isUndefined(this.services[name])) {
      if (_.isUndefined(this.state[name])) {
        this.state[name] = {};
      }

      if (_.isUndefined(this.state[name][id])) {
        const service = new this.services[name]()

        service.m = createMixin(name, id, this, this.options[name].ttl)

        this.state[name][id] = service

        if (_.isFunction(service.initialize)) {
          service.initialize()
        }

        return service
      }

      const service = this.state[name][id]
      service.m.ts = Date.now()

      return service
    }

    throw new Error(`Service ${name}:${id} is unknown`)
  }

  purge (name, id = null) {
    const service = this.get(name, id)

    if (service.m.references === 0) {
      if (_.isFunction(service.destroy)) {
        service.destroy()
      }

      _.forEach(service.m.subscriptions, (s) => {
        s.unsubscribe()
      })

      _.forEach(service.m.cache, (v) => {
        _.forEach(v, (service) => {
          service.m.references = service.m.references - 1
        })
      })

      delete service.m.cache
      delete this.state[name][id]
    }
  }

  listenEvents (name = '*', id = '*', action = '*', cb) {
    return this.events$
      .filter((event) => {
        const [sourceName, sourceId, sourceAction] = event.addr.split(':')

        if ((name === sourceName || name === '*')
            && (id === sourceId || id === '*')
            && (action === sourceAction || action === '*')) {
          return event
        }
      })
      .subscribe({next: cb})
  }

  notify (name, id, action, payload) {
    this.events$.shamefullySendNext({
      addr: `${name}:${id}:${action}`,
      payload
    })
  }

}

function createMixin(name, id, manager, ttl) {
  return {
    name,
    id,
    references: 0,
    ts: Date.now(),
    ttl: ttl,
    cache: {},
    subscriptions: [],

    getCaller() {
      return {
        name: this.name,
        id: this.id
      }
    },

    get (name, id = null) {
      if (_.isUndefined(this.cache[name])) {
        this.cache[name] = {}
      }

      if (!_.isUndefined(this.cache[name][id])) {
        const service = this.cache[name][id]
        service.m.ts = Date.now()

        return service
      }

      const service = manager.get(name, id)

      this.cache[name][id] = service

      if (this.isCyclic()) {
        delete this.cache[name][id]
        return service
      }

      service.m.references = service.m.references + 1

      return service
    },

    listenEvents (...args) {
      this.subscriptions.push(manager.listenEvents(...args))
    },

    notify (event, payload = null) {
      manager.notify(name, id, event, payload)
    },

    isCyclic () {
      let seen = []

      function detect (obj) {
        for (let nameKey in obj) {
          if (obj.hasOwnProperty(nameKey)) {
            for (let idKey in obj[nameKey]) {
              if (obj[nameKey].hasOwnProperty(idKey)) {
                if (seen.indexOf(obj[nameKey][idKey]) !== -1) {
                  return true
                }

                seen.push(obj[nameKey][idKey])

                if (detect(obj[nameKey][idKey].m.cache)) {
                  return true
                }
              }
            }
          }
        }

        return false
      }

      return detect(this.cache)
    }
  }
}

export default new Manager()
