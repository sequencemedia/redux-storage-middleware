import {
  STORAGE_COMPARE,
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import HardStorage from 'redux-storage-middleware/components/storage/hard-storage'
import SoftStorage from 'redux-storage-middleware/components/storage/soft-storage'

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
      data
    } = fromStringToObject(item) || {}

    return data
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        data
      } = fromStringToObject(item) || {}

      return data
    } else {
      const {
        reduxStorage: {
          [type]: {
            data
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
      data: storageData
    } = fromStringToObject(item) || {}

    const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

    hardStorage.setItem(type, ITEM)
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        meta: storageMeta = {},
        data: storageData
      } = fromStringToObject(item) || {}

      const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

      softStorage.setItem(type, ITEM)
    }
  }
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
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(type)
      const {
        meta: storageMeta = {},
        data: storageData
      } = fromStringToObject(item) || {}

      const ITEM = fromObjectToString({ meta: createMeta({ ...storageMeta, ...meta }), ...(data ? { data } : { ...(storageData ? { data: storageData } : {}) }) })

      softStorage.setItem(type, ITEM)
    }
  }
}

function storageClear (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, ...action }) {
  if (isHardStorage) {
    hardStorage.removeItem(type)
  } else {
    if (isSoftStorage) {
      softStorage.removeItem(type)
    }
  }
}

export default (store) => (next) => (action) => {
  const { type } = action

  switch (type) {
    case STORAGE_COMPARE:
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

      return comparator(get(store, action) || {}, ACTION, { cacheFor, ...(cachedAt ? { cachedAt: new Date(cachedAt) } : {}) })
        ? next(put(store, action) || ACTION)
        : then(ACTION)
    }

    case STORAGE_FETCH:
      storageFetch(store, action)
      return next(action)

    case STORAGE_STORE:
      storageStore(store, action)
      return next(action)

    case STORAGE_CLEAR:
      storageClear(store, action)
      return next(action)

    default:
      return next(action)
  }
}
