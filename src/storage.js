import {
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

export const createMeta = ({ cachedAt = 0, cacheFor = 0, accessedAt = 0 } = {}) => (
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

const getStateFromStore = ({ reduxStorage = {} } = {}) => reduxStorage
const getStateForActionType = (type, { [type]: state = {} } = {}) => state

function storageWrite (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {}, data }) {
  if (isHardStorage) {
    const {
      meta: stateMeta = {},
      data: stateData
    } = getStateForActionType(type, getStateFromStore(store.getState()))

    const ITEM = fromObjectToString({ meta: createMeta({ ...stateMeta, ...meta }), ...(stateData ? { data: { ...stateData, ...(data || {}) } } : (data ? { data } : {})) })

    hardStorage.setItem(type, ITEM)
  } else {
    if (isSoftStorage) {
      const {
        meta: stateMeta = {},
        data: stateData
      } = getStateForActionType(type, getStateFromStore(store.getState()))

      const ITEM = fromObjectToString({ meta: createMeta({ ...stateMeta, ...meta }), ...(stateData ? { data: { ...stateData, ...(data || {}) } } : (data ? { data } : {})) })

      softStorage.setItem(type, ITEM)
    }
  }
}

function storageClear (store, { meta: { isHardStorage = false, isSoftStorage = false, type, ...meta } = {} }) {
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
    case STORAGE_FETCH:
      storageWrite(store, action)
      return next(action)

    case STORAGE_STORE:
      storageWrite(store, action)
      return next(action)

    case STORAGE_CLEAR:
      storageClear(store, action)
      return next(action)

    default:
      return next(action)
  }
}
