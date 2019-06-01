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

export const hasCacheFor = (value) => Math.floor(Number(value)) > 0
export const notCacheFor = (value) => isNaN(Number(value)) || Math.floor(Number(value)) < 1

export const filterFetch = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
export const filterStore = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
export const filterClear = ({ meta: { type, cacheFor = 0 } = {} } = {}) => notCacheFor(cacheFor)

export const reduce = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? array.filter(filterFor(type)).reduce(dedupeMeta, [])
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const dedupeMeta = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, i, array) => (
  a.map(mapMetaType).includes(t)
    ? a
    : min(array.filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const reduceFetch = (...args) => reduce(...args)

export const reduceStore = (...args) => reduce(...args)

export const reduceClear = (...args) => reduce(...args)

export const reduceMetaFetch = (...args) => reduceFetch(...args)

export const reduceMetaStore = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? array.filter(filterFor(type)).reduce(dedupeMeta, [])
    : min(array.filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const dedupeFetch = (a = [], { type, meta } = {}) => (
  a.map(mapMetaType).includes(type)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const dedupeStore = (a = [], { type, meta, meta: { type: t } = {} } = {}) => (
  a.map(mapMetaType).includes(t)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const dedupeClear = (a = [], { type, meta, meta: { type: t } = {} } = {}) => (
  a.map(mapMetaType).includes(t)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const dedupeMetaFetch = (...args) => dedupeFetch(...args)

export const dedupeMetaStore = (...args) => dedupeMeta(...args)

export const filterHardStorage = ({ meta } = {}) => isHardStorage(meta)
export const filterSoftStorage = ({ meta } = {}) => isSoftStorage(meta)
export const filterStorage = ({ meta } = {}) => !( // NOT
  isHardStorage(meta) ||
  isSoftStorage(meta)
)

export const filterNotFetchMap = ({ fetchMap = new Map() } = {}, { meta: { type } = {} } = {}) => !fetchMap.has(type)
export const filterNotStoreMap = ({ storeMap = new Map() } = {}, { meta: { type } = {} } = {}) => !storeMap.has(type)
export const filterIsUniqueMap = ({ fetchMap = new Map(), storeMap = new Map() } = {}, { meta: { type } = {} } = {}) => !( // NOT
  fetchMap.has(type) ||
  storeMap.has(type)
)

export const putIntoFetchMap = ({ fetchMap = new Map() } = {}, { type, meta: { cacheFor, comparator } = {} } = {}) => {
  fetchMap.set(type, { type, cacheFor, ...(comparator instanceof Function ? { comparator } : {}) })
}

export const putIntoStoreMap = ({ storeMap = new Map() } = {}, { type, meta: { type: TYPE, ...meta } = {} } = {}) => {
  const storeSet = storeMap.get(TYPE) || new Set()

  storeMap.set(
    TYPE,
    storeSet.add({ ...meta, type })
  )
}

export const putIntoClearMap = ({ clearMap = new Map() } = {}, { type, meta: { type: TYPE, cacheFor, ...meta } = {} } = {}) => {
  const clearSet = clearMap.get(TYPE) || new Set()

  clearMap.set(
    TYPE,
    clearSet.add({ ...meta, type, ...(cacheFor ? { cacheFor } : {}), isNaN: isNaN(cacheFor) })
  )
}

export const putIntoFetchMetaMap = ({ fetchMetaMap = new Map() } = {}, { type, meta: { cacheFor, ...meta } = {} } = {}) => {
  const fetchMetaSet = fetchMetaMap.get(type) || new Set()

  fetchMetaMap.set(
    type,
    fetchMetaSet.add({ ...meta, cacheFor })
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
export const filterClearArray = (array = []) => array.filter(filterClear)

export const filterNotFetchMapArray = (array = [], params = {}) => array.filter((configuration) => filterNotFetchMap(params, configuration))
export const filterIsUniqueMapArray = (array = [], params = {}) => array.filter((configuration) => filterIsUniqueMap(params, configuration))

export const createFetchMetaArray = (array = []) => (
  array
    .reduce(reduceMetaFetch, [])
    .reduce(dedupeMetaFetch, [])
)

export const createStoreMetaArray = (array = []) => (
  array
    .reduce(reduceMetaStore, [])
    .reduce(dedupeMetaStore, [])
)

export const getCachedAt = ({ cachedAt = 0 } = {}) => cachedAt
export const getCacheFor = ({ cacheFor = 0 } = {}) => cacheFor

export function initialiseFetchMetaMap (array = [], params = {}) {
  array
    .forEach((configuration) => { putIntoFetchMetaMap(params, configuration) })
}

export function initialiseFetchHardStorage (array = [], params = {}) {
  filterHardStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((configuration) => { putIntoFetchMap(params, configuration) })
}

export function initialiseFetchSoftStorage (array = [], params = {}) {
  filterSoftStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((configuration) => { putIntoFetchMap(params, configuration) })
}

export function initialiseFetchStorage (array = [], params = {}) {
  filterStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((configuration) => { putIntoFetchMap(params, configuration) })
}

export function initialiseFetch (array = [], params = {}) {
  const fetchArray = filterFetchArray(array)

  initialiseFetchHardStorage(fetchArray, params)

  initialiseFetchSoftStorage(fetchArray, params)

  initialiseFetchStorage(fetchArray, params)
}

export function initialiseStoreMetaMap (array = [], params = {}) {
  array
    .forEach((configuration) => { putIntoStoreMetaMap(params, configuration) })
}

export function initialiseStoreNotFetchMap (array = [], params = {}) {
  filterNotFetchMapArray(array, params)
    .reduce(reduceStore, [])
    .forEach((configuration) => putIntoStoreMap(params, configuration))
}

export function initialiseStoreHardStorage (array = [], params = {}) {
  const hardStorageArray = filterHardStorageArray(array)

  initialiseStoreNotFetchMap(hardStorageArray, params)

  initialiseFetchMetaMap(createFetchMetaArray(hardStorageArray), params)

  initialiseStoreMetaMap(createStoreMetaArray(hardStorageArray), params)
}

export function initialiseStoreSoftStorage (array = [], params = {}) {
  const softStorageArray = filterSoftStorageArray(array)

  initialiseStoreNotFetchMap(softStorageArray, params)

  initialiseFetchMetaMap(createFetchMetaArray(softStorageArray), params)

  initialiseStoreMetaMap(createStoreMetaArray(softStorageArray), params)
}

export function initialiseStoreStorage (array = [], params = {}) {
  const storageArray = filterStorageArray(array)

  initialiseStoreNotFetchMap(storageArray, params)

  initialiseFetchMetaMap(createFetchMetaArray(storageArray), params)

  initialiseStoreMetaMap(createStoreMetaArray(storageArray), params)
}

export function initialiseStore (array = [], params = {}) {
  const storeArray = filterStoreArray(array)

  initialiseStoreHardStorage(storeArray, params)

  initialiseStoreSoftStorage(storeArray, params)

  initialiseStoreStorage(storeArray, params)
}

export function initialiseClearIsUniqueMap (array = [], params = {}) {
  filterIsUniqueMapArray(array, params)
    .reduce(reduceClear, [])
    .forEach((configuration) => putIntoClearMap(params, configuration))
}

export function initialiseClear (array = [], params = {}) {
  const clearArray = filterClearArray(array)

  initialiseClearIsUniqueMap(clearArray, params)
}

export function initialise (array = [], params = {}) {
  initialiseFetch(array, params)

  initialiseStore(array, params)

  initialiseClear(array, params)
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
          store.dispatch(storageWriteAction(META, { ...action, type }))

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
            const {
              data,
              meta: {
                cachedAt = accessedAt
              } = {}
            } = getStateForActionType(type, getStateFromStore(store.getState()))

            const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

            store.dispatch(storageStoreAction(META, data)) // META
          })

          if (storeMetaMap.has(type)) {
            const {
              meta: {
                cacheFor,
                cachedAt // read from state - without default - (it's optional here)
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
