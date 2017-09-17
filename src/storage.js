import {
  REDUX_STORAGE_FETCH,
  REDUX_STORAGE_STORE,
  REDUX_STORAGE_CLEAR,
  storageStateAction,
  storageClearAction
} from 'redux-storage-middleware/actions'

import hardStorage from './storage/hard-storage'
import softStorage from './storage/soft-storage'

const fromObjectToString = (object) => JSON.stringify(object)
const fromStringToObject = (string) => JSON.parse(string)

const storageFetch = (store, { meta, meta: { isHardStorage = false, isSoftStorage = false, type: t } = {} }) => {
  if (isHardStorage) {
    const item = hardStorage.getItem(t)
    const {
      data
    } = fromStringToObject(item)

    store.dispatch(data)
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(t)
      const {
        data
      } = fromStringToObject(item)

      store.dispatch(data)
    } else {
      const {
        reduxStorage: {
          [t]: {
            data
          } = {}
        } = {}
      } = store.getState()

      store.dispatch(data)
    }
  }
}

const storageStore = (store, { meta, meta: { isHardStorage = false, isSoftStorage = false, type: t } = {}, data }) => {
  if (isHardStorage) {
    const item = fromObjectToString({ meta, data })

    hardStorage.setItem(t, item)
  } else {
    hardStorage.removeItem(t)
    if (isSoftStorage) {
      const item = fromObjectToString({ meta, data })

      softStorage.setItem(t, item)
    } else {
      softStorage.removeItem(t)

      store.dispatch(storageStateAction(meta, data))
    }
  }
}

const storageClear = (store) => {
  hardStorage.clear()
  softStorage.clear()
  store.dispatch(storageClearAction())
}

export const storageStoreMiddleware = (store) => (next) => ({ type, ...action }) => (
  (type === REDUX_STORAGE_FETCH)
    ? storageFetch(store, { ...action, type })
    : next({ ...action, type })
)

export const storageFetchMiddleware = (store) => (next) => ({ type, ...action }) => (
  (type === REDUX_STORAGE_STORE)
    ? storageStore(store, { ...action, type })
    : next({ ...action, type })
)

export const storageClearMiddleware = (store) => (next) => ({ type, ...action }) => (
  (type === REDUX_STORAGE_CLEAR)
    ? storageClear(store)
    : next({ ...action, type })
)

export default (store) => (next) => ({ type, ...action }) => {
  switch (type) {
    case REDUX_STORAGE_FETCH:
      return storageFetch(store, { ...action, type })

    case REDUX_STORAGE_STORE:
      return storageStore(store, { ...action, type })

    case REDUX_STORAGE_CLEAR:
      return storageClear(store)

    default:
      return next({ ...action, type })
  }
}
