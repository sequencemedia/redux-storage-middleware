import {
  REDUX_STORAGE_FETCH,
  REDUX_STORAGE_STORE,
  REDUX_STORAGE_CLEAR,
  storageStateAction,
  storageClearAction
} from 'redux-storage-middleware/actions'

import hardStorage from './components/storage/hard-storage'
import softStorage from './components/storage/soft-storage'

const fromObjectToString = (object) => JSON.stringify(object)
const fromStringToObject = (string) => JSON.parse(string)

const storageFetch = (store, { meta, meta: { isHardStorage = false, isSoftStorage = false, type } = {}, ...action }) => {
  if (isHardStorage) {
    const item = hardStorage.getItem(type)
    const {
      data
    } = fromStringToObject(item)

    if (data) store.dispatch(data)
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        data
      } = fromStringToObject(item)

      if (data) store.dispatch(data)
    } else {
      const {
        reduxStorage: {
          [type]: {
            data
          } = {}
        } = {}
      } = store.getState()

      if (data) store.dispatch(data)
    }
  }

  return { ...action, meta }
}

const storageStore = (store, { meta, meta: { isHardStorage = false, isSoftStorage = false, type } = {}, data, ...action }) => {
  if (isHardStorage) {
    const item = fromObjectToString({ meta, data })

    hardStorage.setItem(type, item)
  } else {
    hardStorage.removeItem(type)
    if (isSoftStorage) {
      const item = fromObjectToString({ meta, data })

      softStorage.setItem(type, item)
    } else {
      softStorage.removeItem(type)

      store.dispatch(storageStateAction(meta, data))
    }
  }

  return { ...action, meta, data }
}

const storageClear = (store, action) => {
  hardStorage.clear()
  softStorage.clear()
  store.dispatch(storageClearAction())
  return action
}

export const storageStoreMiddleware = (store) => (next) => ({ type, ...action }) => (
  (type === REDUX_STORAGE_FETCH)
    ? next(storageFetch(store, { ...action, type }))
    : next({ ...action, type })
)

export const storageFetchMiddleware = (store) => (next) => ({ type, ...action }) => (
  (type === REDUX_STORAGE_STORE)
    ? next(storageStore(store, { ...action, type }))
    : next({ ...action, type })
)

export const storageClearMiddleware = (store) => (next) => ({ type, ...action }) => (
  (type === REDUX_STORAGE_CLEAR)
    ? next(storageClear(store))
    : next({ ...action, type })
)

export default (store) => (next) => ({ type, ...action }) => {
  switch (type) {
    case REDUX_STORAGE_FETCH:
      return next(storageFetch(store, { ...action, type }))

    case REDUX_STORAGE_STORE:
      return next(storageStore(store, { ...action, type }))

    case REDUX_STORAGE_CLEAR:
      return next(storageClear(store))

    default:
      return next({ ...action, type })
  }
}
