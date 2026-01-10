import Storage from '#components/storage'

let SOFT_STORAGE

try {
  SOFT_STORAGE = window.sessionStorage ?? (window.sessionStorage = new Storage())
} catch {
  SOFT_STORAGE = new Storage() // (globalThis.sessionStorage instanceof Storage) ? globalThis.sessionStorage : (globalThis.sessionStorage = new Storage())
}

console.log('SOFT_STORAGE', SOFT_STORAGE)

export default SOFT_STORAGE
