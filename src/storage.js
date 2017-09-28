import {
  REDUX_STORAGE_FETCH,
  REDUX_STORAGE_STORE,
  REDUX_STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import HardStorage from './components/storage/hard-storage'
import SoftStorage from './components/storage/soft-storage'

const hardStorage = HardStorage()
const softStorage = SoftStorage()

const fromObjectToString = (object) => JSON.stringify(object)
const fromStringToObject = (string) => JSON.parse(string)

const createType = ({ type, ...meta }) => ({
  ...meta,
  ...(type ? { type } : {})
})

const createIsHardStorage = ({ isHardStorage = false, ...meta }) => ({
  ...meta,
  ...(isHardStorage ? { isHardStorage } : {})
})

const createIsSoftStorage = ({ isSoftStorage = false, ...meta }) => ({
  ...meta,
  ...(isSoftStorage ? { isSoftStorage } : {})
})

const createMeta = (meta = {}) => (
  createType(
    createIsHardStorage(
      createIsSoftStorage(
        meta
      )
    )
  )
)

const storageFetch = (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...META } = {}, ...action }) => {
  if (isHardStorage) {
    const item = hardStorage.getItem(type)
    const {
      data
    } = fromStringToObject(item) || {}

    if (data) store.dispatch(data)
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        data
      } = fromStringToObject(item) || {}

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

  return { ...action, meta: createMeta({ ...META, type, isHardStorage, isSoftStorage }) }
}

const storageStore = (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...META } = {}, data, ...action }) => {
  if (isHardStorage) {
    const item = hardStorage.getItem(type)
    const {
      meta = {}
    } = fromStringToObject(item) || {}

    /*
     *  Save a few bytes by dropping "type" from the meta
     */
    const ITEM = fromObjectToString({ meta: createMeta({ ...meta, ...META }), ...(data ? { data } : {}) })

    hardStorage.setItem(type, ITEM)

    /*
     *  Restore "type" to the meta on the action
     */
    return { ...action, meta: createMeta({ ...meta, ...META, type, isHardStorage, isSoftStorage }), ...(data ? { data } : {}) }
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        meta = {}
      } = fromStringToObject(item) || {}

      /*
       *  Save a few bytes by dropping "type" from the meta
       */
      const ITEM = fromObjectToString({ meta: createMeta({ ...meta, ...META }), ...(data ? { data } : {}) })

      softStorage.setItem(type, ITEM)

      /*
       *  Restore "type" to the meta on the action
       */
      return { ...action, meta: createMeta({ ...meta, ...META, type, isHardStorage, isSoftStorage }), ...(data ? { data } : {}) }
    } else {
      const {
        reduxStorage: {
          [type]: {
            meta
          } = {}
        } = {}
      } = store.getState()

      return { ...action, meta: createMeta({ ...meta, ...META, type, isHardStorage, isSoftStorage }), ...(data ? { data } : {}) }
    }
  }
}

const storageClear = (store, { meta: { type, ...META } = {}, ...action }) => {
  if (type) {
    hardStorage.removeItem(type)
    softStorage.removeItem(type)
    return { ...action, meta: { type, ...META } }
  }
  return { ...action, meta: META }
}

export const storageFetchMiddleware = (store) => (next) => ({ type, ...action }) => (
  (type === REDUX_STORAGE_FETCH)
    ? next(storageFetch(store, { ...action, type }))
    : next({ ...action, type })
)

export const storageStoreMiddleware = (store) => (next) => ({ type, ...action }) => (
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
      return next(storageClear(store, { ...action, type }))

    default:
      return next({ ...action, type })
  }
}
