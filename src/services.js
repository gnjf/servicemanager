export class A {
  constructor () {
    console.log('A constructor')
  }

  initialize () {
    console.log('A initialize', this.m.getCaller().id)
    this.m.notify('initialized')
  }

  destroy () {
    console.log('A destroy', this.m.getCaller().id)
    this.m.notify('destroyed')
  }

  doSomething () {
    this.m.get('b')
    this.m.notify('did-something')
  }
}

export class B {
  constructor () {
    console.log('B constructor')
  }

  initialize () {
    console.log('B initialize', this.m.getCaller().id)
    this.m.get('c')
    this.m.notify('initialized')
  }

  destroy () {
    console.log('B destroy', this.m.getCaller().id)
    this.m.notify('destroyed')
  }
}

export class C {
  constructor () {
    console.log('C constructor')
  }

  initialize () {
    console.log('C initialize', this.m.getCaller().id)
    this.m.get('d')

    this.m.listenEvents('a', '*', '*', (action) => {
      console.log(`C catch event from A ${action.addr}`);
    })

    this.m.notify('initialized')
  }

  destroy () {
    console.log('C destroy', this.m.getCaller().id)
    this.m.notify('destroyed')
  }
}

export class D {
  constructor () {
    console.log('D constructor')
  }

  initialize () {
    console.log('D initialize', this.m.getCaller().id)
    this.m.get('a')
    this.m.notify('initialized')
  }

  destroy () {
    console.log('D destroy', this.m.getCaller().id)
    this.m.notify('destroyed')
  }
}
