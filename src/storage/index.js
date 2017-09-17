const storage = Symbol.for('storage')

export default class Storage {
  constructor () {
    this[storage] = new Map()
  }

  getItem (key) {
    return this[storage].get(key)
  }

  setItem (key, value) {
    this[storage].set(key, value)
  }

  removeItem (key) {
    this[storage].remove(key)
  }

  clear () {
    this[storage].clear()
  }
}
