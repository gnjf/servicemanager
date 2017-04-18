API

```javascript
manager.registerServices(
  {
    name: 'service_a_name',  // string, name of the service
    klass: ServiceA,         // references to object respresents the service
    ttl: 5000,               // time to live, how long the manager should store instances of this service
    keep: 0                  // how many instances should survive GC
  },
  {
    name: 'service_b_name',
    klass: ServiceB,
    ttl: 0                   // instances of ServiceB will survive GC, default value
  },
  {
    name: 'service_c_name',
    klass: ServiceC,
    ttl: 10000,
    keep: 20                 // GC will keep at least 20 youngest instances of that service
  }
)

manager.get(name, id)        // lookup manager's state, return or create new instance of service

// Manager tracks each instance of service with additional information by defining the property `m`:

service.m = {
  name,                      // service's name
  id,                        // service's id
  references: 0,             // how many other instances references this service instance, a reference counter
  ts: Date.now(),            // timestamp, updates on every instance access, used to distinguish instances age
  ttl: ttl,                  // how long instance should live, that option comes from registerServices function
  cache: {},                 // used to store references to other services instances
  subscriptions: {},         // used to store subscriptions objects

  getCaller(),

  get(name, id),             // used from service to get refrences to other services
                             // tracks who uses what
                             // checks for cyclic dependencies

  listenEvents(),            // same as manager.listenEvents

  notify(action, payload),   // broadcast the payload with specific action

  isCyclic()                 // checks for cyclic dependencies
}


manager.purge(name, id)      // removes instance and deallocates resources
                             // first checks if any other services uses removable instance
                             // call instance's lifecycle method
                             // then delete instance

Pub/Sub

Can be used to exchange information between services and services or services and other system:

manager.listenEvents(name, id, action, cb) // name - service name, string
                                           // id - instance id, string
                                           // action - uniq identifier, string
                                           // cb - callback
                                           // name, id, action - can be just '*'

manager.listenEvents('*', '*', '*', _.noop) // will catch all events from
manager.listenEvents('service_a_name', '*', '*', _.noop) // will listen for any events from any instance of
                                                         // ServiceA

manager.listenEvents('*', '*', 'destroyed', _.noop) // will listen only for 'destoryed' events

manager.notify(name, id, action, payload)  // sends payload
```
