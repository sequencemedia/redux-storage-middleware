import {
  storageFetchAction,
  storageStoreAction,
  storageWriteAction,
  storageClearAction
} from 'redux-storage-middleware/actions'

export const min = (values = []) => Math.min(...values)
export const max = (values = []) => Math.max(...values)

export const isStale = ({ cachedAt = 0, cacheFor = 0 } = {}) => (cachedAt + cacheFor) < Date.now()
export const isEqual = (alpha = {}, omega = {}) => (
  getCachedAt(alpha) === getCachedAt(omega) &&
  getCacheFor(alpha) === getCacheFor(omega)
)
export const isHardStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60 * 24)
export const isSoftStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60) && cacheFor < (1000 * 60 * 60 * 24)
export const hasComparator = ({ comparator = null } = {}) => comparator instanceof Function

export const filterFor = (t) => ({ type } = {}) => type === t
export const filterMetaFor = (t) => ({ meta: { type } = {} } = {}) => type === t

export const mapType = ({ type = null } = {}) => type
export const mapMetaType = ({ meta: { type = null } = {} } = {}) => type
export const mapCacheFor = ({ meta: { cacheFor = 0 } = {} } = {}) => cacheFor
export const mapCachedAt = ({ meta: { cachedAt = 0 } = {} } = {}) => cachedAt

export const createIsHardStorage = (meta) => ({ ...meta, ...(isHardStorage(meta) ? { isHardStorage: true } : {}) })
export const createIsSoftStorage = (meta) => ({ ...meta, ...(isSoftStorage(meta) ? { isSoftStorage: true } : {}) })

export const createComparator = ({ comparator = null, ...meta } = {}) => ({ ...meta, ...(comparator ? { comparator } : {}) })
export const createAccessedAt = ({ accessedAt = null, ...meta } = {}) => ({ ...meta, ...(accessedAt ? { accessedAt } : {}) })
export const createCachedAt = ({ cachedAt = null, ...meta } = {}) => ({ ...meta, ...(cachedAt ? { cachedAt } : {}) })
export const createCacheFor = ({ cacheFor = null, ...meta } = {}) => ({ ...meta, ...(cacheFor ? { cacheFor } : {}) })

export const createMeta = (meta = {}) => (
  createIsHardStorage(
    createIsSoftStorage(
      createCacheFor(
        createCachedAt(
          createAccessedAt(
            createComparator(
              meta
            )
          )
        )
      )
    )
  )
)

export const hasCachedAt = ({ cachedAt = 0 } = {}) => Math.floor(Number(cachedAt)) > 0
export const hasCacheFor = ({ cacheFor = 0 } = {}) => Math.floor(Number(cacheFor)) > 0
export const notCachedAt = ({ cachedAt = 0 } = {}) => isNaN(Number(cachedAt)) || Math.floor(Number(cachedAt)) < 1
export const notCacheFor = ({ cacheFor = 0 } = {}) => isNaN(Number(cacheFor)) || Math.floor(Number(cacheFor)) < 1

export const filterFetch = ({ meta = {} } = {}) => hasCacheFor(meta)
export const filterStore = ({ meta = {} } = {}) => hasCacheFor(meta)
export const filterClear = ({ meta = {} } = {}) => notCacheFor(meta)

export const getCachedAt = ({ cachedAt = 0 } = {}) => cachedAt
export const getCacheFor = ({ cacheFor = 0 } = {}) => cacheFor

export const reduceFetch = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor // min `cacheFor` among all metas for this FETCH type
      ? a
      : a.concat({ type, ...(meta ? { meta: { cacheFor } } : {}) }) // don't care about `type`
)

export const reduceFetchMeta = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, i, array) => (
  a.filter(filterFor(type)).map(mapMetaType).includes(t)
    ? a
    : min(array.filter(filterFor(type)).filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const reduceStore = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, i, array) => (
  a.filter(filterFor(type)).map(mapMetaType).includes(t)
    ? a
    : min(array.filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor // smallest cacheFor among all metas of this STORE type
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const reduceStoreMeta = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, i, array) => (
  a.filter(filterFor(type)).map(mapMetaType).includes(t)
    ? a
    : min(array.filter(filterFor(type)).filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const filterHardStorage = ({ meta } = {}) => isHardStorage(meta)
export const filterSoftStorage = ({ meta } = {}) => isSoftStorage(meta)
export const filterStorage = ({ meta } = {}) => !( // NOT
  isHardStorage(meta) ||
  isSoftStorage(meta)
)

export const putIntoFetchMap = ({ fetchMap = new Map() } = {}, { type, meta = {} } = {}) => {
  fetchMap.set(type, { ...meta, type })
}

export const putIntoFetchMetaMap = ({ fetchMetaMap = new Map() } = {}, { type, meta = {} } = {}) => {
  const fetchMetaSet = fetchMetaMap.get(type) || new Set()

  fetchMetaMap.set(
    type,
    fetchMetaSet.add(meta)
  )
}

export const putIntoStoreMap = ({ storeMap = new Map() } = {}, { type, meta: { type: TYPE, ...meta } = {} } = {}) => {
  const storeSet = storeMap.get(TYPE) || new Set()

  storeMap.set(
    TYPE,
    storeSet.add({ ...meta, type })
  )
}

export const putIntoStoreMetaMap = ({ storeMetaMap = new Map() } = {}, { meta: { type, cacheFor } = {} } = {}) => {
  storeMetaMap.set(type, { type, cacheFor })
}

export const filterHardStorageArray = (array = []) => array.filter(filterHardStorage)
export const filterSoftStorageArray = (array = []) => array.filter(filterSoftStorage)
export const filterStorageArray = (array = []) => array.filter(filterStorage)

export const filterFetchArray = (array = []) => array.filter(filterFetch)
export const filterStoreArray = (array = []) => array.filter(filterStore)

export const reduceFetchArray = (array = []) => array.reduce(reduceFetch, [])
export const reduceStoreArray = (array = []) => array.reduce(reduceStore, [])
export const reduceFetchMetaArray = (array = []) => array.reduce(reduceFetchMeta, [])
export const reduceStoreMetaArray = (array = []) => array.reduce(reduceStoreMeta, [])

export function initialiseFetchMap (array = [], params = {}) {
  array
    .forEach((configuration) => { putIntoFetchMap(params, configuration) })
}

export function initialiseFetchMetaMap (array = [], params = {}) {
  array
    .forEach((configuration) => { putIntoFetchMetaMap(params, configuration) })
}

export function initialiseStoreMap (array = [], params = {}) {
  array
    .forEach((configuration) => { putIntoStoreMap(params, configuration) })
}

export function initialiseStoreMetaMap (array = [], params = {}) {
  array
    .forEach((configuration) => { putIntoStoreMetaMap(params, configuration) })
}

export function initialiseFetchHardStorage (array = [], params = {}) {
  const fetchArray = filterHardStorageArray(array)

  initialiseFetchMap(reduceFetchArray(fetchArray), params)

  initialiseFetchMetaMap(reduceFetchMetaArray(fetchArray), params)
}

export function initialiseFetchSoftStorage (array = [], params = {}) {
  const fetchArray = filterSoftStorageArray(array)

  initialiseFetchMap(reduceFetchArray(fetchArray), params)

  initialiseFetchMetaMap(reduceFetchMetaArray(fetchArray), params)
}

export function initialiseFetchStorage (array = [], params = {}) {
  const fetchArray = filterStorageArray(array)

  initialiseFetchMap(reduceFetchArray(fetchArray), params)

  initialiseFetchMetaMap(reduceFetchMetaArray(fetchArray), params)
}

export function initialiseFetch (array = [], params = {}) {
  const fetchArray = filterFetchArray(array)

  initialiseFetchHardStorage(fetchArray, params)

  initialiseFetchSoftStorage(fetchArray, params)

  initialiseFetchStorage(fetchArray, params)
}

export function initialiseStoreHardStorage (array = [], params = {}) {
  const storeArray = filterHardStorageArray(array)

  initialiseStoreMap(reduceStoreArray(storeArray), params)

  initialiseStoreMetaMap(reduceStoreMetaArray(storeArray), params)
}

export function initialiseStoreSoftStorage (array = [], params = {}) {
  const storeArray = filterSoftStorageArray(array)

  initialiseStoreMap(reduceStoreArray(storeArray), params)

  initialiseStoreMetaMap(reduceStoreMetaArray(storeArray), params)
}

export function initialiseStoreStorage (array = [], params = {}) {
  const storeArray = filterStorageArray(array)

  initialiseStoreMap(reduceStoreArray(storeArray), params)

  initialiseStoreMetaMap(reduceStoreMetaArray(storeArray), params)
}

export function initialiseStore (array = [], params = {}) {
  const storeArray = filterStoreArray(array)

  initialiseStoreHardStorage(storeArray, params)

  initialiseStoreSoftStorage(storeArray, params)

  initialiseStoreStorage(storeArray, params)
}

export function initialise (array = [], params = {}) {
  initialiseFetch(array, params)

  initialiseStore(array, params)
}

const getStateFromStore = ({ reduxStorage = {} } = {}) => reduxStorage
const getStateForActionType = (type, { [type]: state = {} } = {}) => state

export default (array, configuration = {}) => {
  if (Array.isArray(array)) {
    const {
      fetchMap = new Map(),
      storeMap = new Map(),
      fetchMetaMap = new Map(),
      storeMetaMap = new Map(),
      clearMap = new Map()
    } = configuration

    initialise(array, { fetchMap, storeMap, fetchMetaMap, storeMetaMap, clearMap })

    return (store) => (next) => ({ type, ...action } = {}) => {
      if (fetchMap.has(type)) {
        const accessedAt = Date.now()

        const {
          meta: {
            cacheFor, // read from state or fetchMap
            cachedAt // read from state - without default - ONLY
          } = fetchMap.get(type)
        } = getStateForActionType(type, getStateFromStore(store.getState()))

        const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

        if (isStale(META)) {
          store.dispatch(storageWriteAction({ ...META, cachedAt: accessedAt }, { ...action, type }))

          if (fetchMetaMap.has(type)) {
            const fetchMetaSet = fetchMetaMap.get(type)

            fetchMetaSet.forEach(({ type }) => {
              const state = getStateForActionType(type, getStateFromStore(store.getState()))

              const {
                meta
              } = state

              if (meta) {
                const {
                  cacheFor,
                  cachedAt
                } = meta

                const {
                  data
                } = state

                const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

                store.dispatch(storageClearAction(META, data))
              }
            })
          }

          /*
           *  Pass along to the next middleware
           */
          return next({ ...action, type })
        } else {
          store.dispatch(storageFetchAction(META, { ...action, type }))

          /*
           *  `fetchMetaMap` contains a list of actions to replay for this `type`
           */
          if (fetchMetaMap.has(type)) {
            const fetchMetaSet = fetchMetaMap.get(type)

            fetchMetaSet.forEach(({ type }) => {
              const state = getStateForActionType(type, getStateFromStore(store.getState()))

              const {
                meta
              } = state

              if (meta) {
                const {
                  cacheFor,
                  cachedAt
                } = meta

                const {
                  data
                } = state

                const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

                store.dispatch(storageFetchAction(META, data))

                /**
                 *  REPLAY
                 */
                if (data) store.dispatch(data)
              }
            })
          }

          /*
           *  Do not pass along to the next middleware
           */
          return { ...action, type }
        }
      } else {
        if (storeMap.has(type)) {
          const accessedAt = Date.now()

          const storeSet = storeMap.get(type)

          storeSet.forEach(({ type, cacheFor }) => {
            const state = getStateForActionType(type, getStateFromStore(store.getState()))

            const {
              meta
            } = state

            if (hasCachedAt(meta)) {
              const {
                cacheFor,
                cachedAt
              } = meta

              const {
                data
              } = state

              const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

              store.dispatch(storageStoreAction(META, data)) // META
            }
          })

          if (storeMetaMap.has(type)) {
            const {
              meta: {
                cacheFor,
                cachedAt = accessedAt // read from state if state is available. Supply default otherwise
              } = storeMetaMap.get(type)
            } = getStateForActionType(type, getStateFromStore(store.getState()))

            const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

            store.dispatch(storageStoreAction(META, { ...action, type })) // META, DATA
          }

          return next({ ...action, type })
        }
      }

      return next({ ...action, type })
    }
  }

  return () => (next) => (action) => next(action)
}
