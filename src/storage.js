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

export const fromObjectToString = (object) => JSON.stringify(object)
export const fromStringToObject = (string) => JSON.parse(string)

export const createType = ({ type, ...meta }) => ({
  ...meta,
  ...(type ? { type } : {})
})

export const createIsHardStorage = ({ isHardStorage = false, ...meta }) => ({
  ...meta,
  ...(isHardStorage ? { isHardStorage } : {})
})

export const createIsSoftStorage = ({ isSoftStorage = false, ...meta }) => ({
  ...meta,
  ...(isSoftStorage ? { isSoftStorage } : {})
})

export const createCachedAt = ({ cachedAt = 0, ...meta }) => ({
  ...meta,
  ...(cachedAt ? { cachedAt } : {})
})

export const createCacheFor = ({ cacheFor = 0, ...meta }) => ({
  ...meta,
  ...(cacheFor ? { cacheFor } : {})
})

export const createAccessedAt = ({ accessedAt = false, ...meta }) => ({
  ...meta,
  ...(accessedAt ? { accessedAt } : {})
})

export const createMeta = (meta = {}) => (
  createType(
    createIsHardStorage(
      createIsSoftStorage(
        meta
      )
    )
  )
)

export const transformMeta = ({ cachedAt = 0, cacheFor = 0, accessedAt = 0 } = {}) => (
  createCachedAt(
    createCacheFor(
      createAccessedAt(
        { cachedAt, cacheFor, accessedAt }
      )
    )
  )
)

export const mergeMeta = (alpha, omega) => ({
  meta: { ...(alpha || {}), ...(omega || {}) }
})

export const mergeData = (alpha, omega) => ({
  ...(alpha ? { data: { ...alpha, ...(omega || {}) } } : (omega ? { data: omega } : {}))
})

function get (store, { meta: { isHardStorage = false, isSoftStorage = false, type } = {} }) {
  if (isHardStorage) {
    const {
      data
    } = getStateForType(type, getReduxStorage(store.getState()))

    return data
  } else {
    if (isSoftStorage) {
      const {
        data
      } = getStateForType(type, getReduxStorage(store.getState()))

      return data
    } else {
      const {
        data
      } = getStateForType(type, getReduxStorage(store.getState()))

      return data
    }
  }
}

const getReduxStorage = ({ reduxStorage = {} } = {}) => reduxStorage
const getStateForType = (type, { [type]: state = {} } = {}) => state

function put (store, { meta: META, meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, data }) {
  if (isHardStorage) {
    const {
      meta: stateMeta = {},
      data: stateData
    } = getStateForType(type, getReduxStorage(store.getState()))

    const ITEM = fromObjectToString({ meta: transformMeta({ ...stateMeta, ...meta }), ...(data ? { data } : { ...(stateData ? { data: stateData } : {}) }) })

    hardStorage.setItem(type, ITEM)
  } else {
    if (isSoftStorage) {
      const {
        meta: stateMeta = {},
        data: stateData
      } = getStateForType(type, getReduxStorage(store.getState()))

      const ITEM = fromObjectToString({ meta: transformMeta({ ...stateMeta, ...meta }), ...(data ? { data } : { ...(stateData ? { data: stateData } : {}) }) })

      softStorage.setItem(type, ITEM)
    }
  }
}

function storageFetch (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, data }) {
  if (isHardStorage) {
    const {
      meta: stateMeta = {},
      data: stateData
    } = getStateForType(type, getReduxStorage(store.getState()))

    const ITEM = fromObjectToString({ meta: transformMeta({ ...stateMeta, ...meta }), ...(stateData ? { data: { ...stateData, ...(data || {}) } } : (data ? { data } : {})) })

    hardStorage.setItem(type, ITEM)
  } else {
    if (isSoftStorage) {
      const {
        meta: stateMeta = {},
        data: stateData
      } = getStateForType(type, getReduxStorage(store.getState()))

      const ITEM = fromObjectToString({ meta: transformMeta({ ...stateMeta, ...meta }), ...(stateData ? { data: { ...stateData, ...(data || {}) } } : (data ? { data } : {})) })

      softStorage.setItem(type, ITEM)
    }
  }
}

function storageStore (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, data }) {
  if (isHardStorage) {
    const {
      meta: stateMeta = {},
      data: stateData
    } = getStateForType(type, getReduxStorage(store.getState()))

    const ITEM = fromObjectToString({ meta: transformMeta({ ...stateMeta, ...meta }), ...(stateData ? { data: { ...stateData, ...(data || {}) } } : (data ? { data } : {})) })

    hardStorage.setItem(type, ITEM)
  } else {
    if (isSoftStorage) {
      const {
        meta: stateMeta = {},
        data: stateData
      } = getStateForType(type, getReduxStorage(store.getState()))

      const ITEM = fromObjectToString({ meta: transformMeta({ ...stateMeta, ...meta }), ...(stateData ? { data: { ...stateData, ...(data || {}) } } : (data ? { data } : {})) })

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
