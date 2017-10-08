const storage = Symbol.for('storage')

export default class Storage {
  constructor () {
    this[storage] = new Map()
  }

  getItem (key) {
    const map = this[storage]

    return map.has(key)
      ? `${map.get(key)}`
      : null
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

  key (index) {
    return this[storage].keys[index]
  }

  get length () {
    return this[storage].size
  }
}
