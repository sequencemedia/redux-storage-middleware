const storage = Symbol.for('storage')

export default class Storage {
  constructor (map = new Map()) {
    this[storage] = map
  }

  getItem (key) {
    const map = this[storage]

    return map.has(key)
      ? String(map.get(key))
      : null
  }

  setItem (key, value) {
    this[storage].set(key, value)
  }

  removeItem (key) {
    this[storage].delete(key)
  }

  clear () {
    this[storage].clear()
  }

  key (index) {
    return Array.from(this[storage].keys())[index]
  }

  get length () {
    return this[storage].size
  }
}
