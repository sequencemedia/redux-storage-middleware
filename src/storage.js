import {
  REDUX_STORAGE_COMPARISON,
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

function get (store, { meta: { isHardStorage = false, isSoftStorage = false, type } = {} }) {
  if (isHardStorage) {
    const item = hardStorage.getItem(type)
    const {
      data = {}
    } = fromStringToObject(item) || {}

    return data
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        data = {}
      } = fromStringToObject(item) || {}

      return data
    } else {
      const {
        reduxStorage: {
          [type]: {
            data = {}
          } = {}
        } = {}
      } = store.getState()

      return data
    }
  }
}

function put (store, { meta: META, meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, data }) {
  if (isHardStorage) {
    const item = hardStorage.getItem(type)
    const {
      meta: storageMeta = {},
      data: storageData = {}
    } = fromStringToObject(item) || {}

    const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

    hardStorage.setItem(type, ITEM)
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        meta: storageMeta = {},
        data: storageData = {}
      } = fromStringToObject(item) || {}

      const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

      softStorage.setItem(type, ITEM)
    }
  }

  return data
}

function storageFetch (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, data, ...action }) {
  if (isHardStorage) {
    const item = hardStorage.getItem(type)
    const {
      meta: storageMeta = {},
      data: storageData
    } = fromStringToObject(item) || {}

    const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

    hardStorage.setItem(type, ITEM)

    if (storageData) store.dispatch(storageData)
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        meta: storageMeta = {},
        data: storageData
      } = fromStringToObject(item) || {}

      const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

      softStorage.setItem(type, ITEM)

      if (storageData) store.dispatch(storageData)
    } else {
      const {
        reduxStorage: {
          [type]: {
            data: storageData
          } = {}
        } = {}
      } = store.getState()

      if (storageData) store.dispatch(storageData)
    }
  }

  return { ...action, meta: createMeta({ ...meta, type, isHardStorage, isSoftStorage }) }
}

function storageStore (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, data, ...action }) {
  if (isHardStorage) {
    const item = hardStorage.getItem(type)
    const {
      meta: storageMeta = {},
      data: storageData
    } = fromStringToObject(item) || {}

    const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

    hardStorage.setItem(type, ITEM)

    return { ...action, meta: createMeta({ ...storageMeta, ...meta, type, isHardStorage, isSoftStorage }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) }
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        meta: storageMeta = {},
        data: storageData
      } = fromStringToObject(item) || {}

      const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

      softStorage.setItem(type, ITEM)

      return { ...action, meta: createMeta({ ...storageMeta, ...meta, type, isHardStorage, isSoftStorage }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) }
    } else {
      const {
        reduxStorage: {
          [type]: {
            meta: storageMeta = {},
            data: storageData
          } = {}
        } = {}
      } = store.getState()

      return { ...action, meta: createMeta({ ...storageMeta, ...meta, type, isHardStorage, isSoftStorage }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) }
    }
  }
}

function storageClear (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, ...action }) {
  if (isHardStorage) {
    hardStorage.removeItem(type)

    return { ...action, meta: { type, ...meta } }
  } else {
    if (isSoftStorage) {
      softStorage.removeItem(type)

      return { ...action, meta: { type, ...meta } }
    }
  }

  return { ...action, meta: { type, ...meta } }
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

export default (store) => (next) => (action) => {
  const { type } = action

  switch (type) {
    case REDUX_STORAGE_COMPARISON:
    {
      const {
        meta: {
          cacheFor,
          cachedAt,
          comparator,
          then
        },
        data: ACTION
      } = action

      return comparator(get(store, action), ACTION, { cacheFor, ...(cachedAt ? { cachedAt: new Date(cachedAt) } : {}) })
        ? next(put(store, action))
        : then(ACTION)
    }

    case REDUX_STORAGE_FETCH:
      return next(storageFetch(store, action))

    case REDUX_STORAGE_STORE:
      return next(storageStore(store, action))

    case REDUX_STORAGE_CLEAR:
      return next(storageClear(store, action))

    default:
      return next(action)
  }
}
