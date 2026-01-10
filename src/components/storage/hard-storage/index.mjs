import Storage from '#components/storage'

let HARD_STORAGE // = new Storage()

try {
  HARD_STORAGE = window.localStorage ?? (window.localStorage = new Storage())
} catch {
  HARD_STORAGE = new Storage() // HARD_STORAGE = (globalThis.localStorage instanceof Storage) ? globalThis.localStorage : (globalThis.localStorage = new Storage())
}

export default HARD_STORAGE
