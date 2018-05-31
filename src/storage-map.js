import {
  storageCompareAction,
  storageFetchAction,
  storageStoreAction,
  storageClearAction
} from 'redux-storage-middleware/actions'

export const min = (values = []) => Math.min(...values)
export const max = (values = []) => Math.max(...values)

export const isStale = ({ cachedAt = 0, cacheFor = 0 } = {}) => (cachedAt + cacheFor) < Date.now()
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

export const hasCacheFor = (value) => !!Number(value)
export const notCacheFor = (value) => !(Number(value))

export const filterFetch = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
export const filterStore = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
export const filterClear = ({ meta: { type, cacheFor = 0 } = {} } = {}) => notCacheFor(cacheFor)

export const reduceFetch = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const reduceStore = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const reduceClear = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const dedupeFetch = (a = [], { type, meta } = {}) => (
  a.map(mapType).includes(type)
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

export const putIntoFetchMetaMap = ({ fetchMetaMap = new Map() } = {}, { type, meta: { cacheFor, ...meta } }) => {
  const fetchMetaSet = fetchMetaMap.get(type) || new Set()

  fetchMetaMap.set(
    type,
    fetchMetaSet.add({ ...meta, cacheFor })
  )
}

export const putIntoStoreMetaMap = ({ storeMetaMap = new Map() } = {}, { meta: { type, cacheFor } }) => {
  const storeMetaSet = storeMetaMap.get(type) || new Set()

  storeMetaMap.set(
    type,
    storeMetaSet.add({ type, cacheFor })
  )
}

export const filterStoreHardStorageArray = (array = []) => array.filter(filterHardStorage)
export const filterStoreSoftStorageArray = (array = []) => array.filter(filterSoftStorage)
export const filterStoreStorageArray = (array = []) => array.filter(filterStorage)

export const filterFetchArray = (array = []) => array.filter(filterFetch)
export const filterStoreArray = (array = []) => array.filter(filterStore)
export const filterClearArray = (array = []) => array.filter(filterClear)

export const filterNotFetchMapArray = (params = {}, array = []) => array.filter((configuration) => filterNotFetchMap(params, configuration))
export const filterIsUniqueMapArray = (params = {}, array = []) => array.filter((configuration) => filterIsUniqueMap(params, configuration))

export const createStoreMetaArray = (array = []) => (
  array
    .reduce(reduceStore, [])
    .reduce(dedupeStore, [])
)

export function initialiseFetchMetaMap (params = {}, array = []) {
  array
    .forEach((configuration) => putIntoFetchMetaMap(params, configuration))
}

export function initialiseFetchHardStorage (params = {}, array = []) {
  filterStoreHardStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((configuration) => putIntoFetchMap(params, configuration))
}

export function initialiseFetchSoftStorage (params = {}, array = []) {
  filterStoreSoftStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((configuration) => putIntoFetchMap(params, configuration))
}

export function initialiseFetchStorage (params = {}, array = []) {
  filterStoreStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((configuration) => putIntoFetchMap(params, configuration))
}

export function initialiseFetch (params = {}, array = []) {
  const fetchArray = filterFetchArray(array)

  initialiseFetchHardStorage(params, fetchArray)

  initialiseFetchSoftStorage(params, fetchArray)

  initialiseFetchStorage(params, fetchArray)
}

export function initialiseStoreMetaMap (params = {}, array = []) {
  array
    .forEach((configuration) => putIntoStoreMetaMap(params, configuration))
}

export function initialiseStoreNotFetchMap (params = {}, array = []) {
  filterNotFetchMapArray(params, array)
    .reduce(reduceStore, [])
    .forEach((configuration) => putIntoStoreMap(params, configuration))
}

export function initialiseStoreHardStorage (params = {}, array = []) {
  const hardStorageArray = filterStoreHardStorageArray(array)

  initialiseStoreNotFetchMap(params, hardStorageArray)

  const hardStorageMetaArray = createStoreMetaArray(hardStorageArray)

  initialiseFetchMetaMap(params, hardStorageMetaArray)

  initialiseStoreMetaMap(params, hardStorageMetaArray)
}

export function initialiseStoreSoftStorage (params = {}, array = []) {
  const softStorageArray = filterStoreSoftStorageArray(array)

  initialiseStoreNotFetchMap(params, softStorageArray)

  const softStorageMetaArray = createStoreMetaArray(softStorageArray)

  initialiseFetchMetaMap(params, softStorageMetaArray)

  initialiseStoreMetaMap(params, softStorageMetaArray)
}

export function initialiseStoreStorage (params = {}, array = []) {
  const storageArray = filterStoreStorageArray(array)

  initialiseStoreNotFetchMap(params, storageArray)

  const storageMetaArray = createStoreMetaArray(storageArray)

  initialiseFetchMetaMap(params, storageMetaArray)

  initialiseStoreMetaMap(params, storageMetaArray)
}

export function initialiseStore (params = {}, array = []) {
  const storeArray = filterStoreArray(array)

  initialiseStoreHardStorage(params, storeArray)

  initialiseStoreSoftStorage(params, storeArray)

  initialiseStoreStorage(params, storeArray)
}

export function initialiseClearIsUniqueMap (params = {}, array = []) {
  filterIsUniqueMapArray(params, array)
    .reduce(reduceClear, [])
    .forEach((configuration) => putIntoClearMap(params, configuration))
}

export function initialiseClear (params = {}, array = []) {
  const clearArray = filterClearArray(array)

  initialiseClearIsUniqueMap(params, clearArray)
}

export function initialise (params = {}, array = []) {
  initialiseFetch(params, array)

  initialiseStore(params, array)

  initialiseClear(params, array)
}

export default (array) => {
  if (Array.isArray(array)) {
    const fetchMap = new Map()
    const storeMap = new Map()
    const fetchMetaMap = new Map()
    const storeMetaMap = new Map()
    const clearMap = new Map()

    initialise({ fetchMap, storeMap, fetchMetaMap, storeMetaMap, clearMap }, array)

    return (store) => (next) => ({ type, ...action } = {}) => {
      if (fetchMap.has(type)) {
        const defaultMeta = fetchMap.get(type)
        /*
         *  'cachedAt' is kept in state
         */
        const {
          reduxStorage: {
            [type]: {
              meta = defaultMeta
            } = {}
          } = {}
        } = store.getState()

        if (hasComparator(defaultMeta)) {
          const {
            cacheFor,
            comparator
          } = defaultMeta

          const {
            cachedAt
          } = meta

          const META = createMeta({
            type,
            cacheFor,
            cachedAt,
            comparator,
            then: ({ type, ...action }) => {
              const accessedAt = Date.now()

              if (fetchMetaMap.has(type)) {
                const fetchMetaSet = fetchMetaMap.get(type)

                fetchMetaSet.forEach(({ type, cacheFor }) => {
                  /*
                   *  Store meta
                   */
                  const META = createMeta({ type, cacheFor, accessedAt })

                  store.dispatch(storageFetchAction(META))
                })
              }

              /*
               *  Fetch meta
               */
              const META = createMeta({ type, cacheFor, accessedAt })

              store.dispatch(storageFetchAction(META, { ...action, type }))

              return { ...action, type }
            }
          })

          store.dispatch(storageCompareAction(META, { ...action, type }))

          return { ...action, type }
        } else {
          const {
            cacheFor
          } = defaultMeta

          const {
            cachedAt
          } = meta

          const META = createMeta({ type, cacheFor, cachedAt })

          if (isStale(META)) {
            return next({ ...action, type })
          } else {
            const accessedAt = Date.now()

            if (fetchMetaMap.has(type)) {
              const fetchMetaSet = fetchMetaMap.get(type)

              fetchMetaSet.forEach(({ type, cacheFor }) => {
                /*
                 *  Store meta
                 */
                const META = createMeta({ type, cacheFor, accessedAt })

                store.dispatch(storageFetchAction(META))
              })
            }

            /*
             *  Fetch meta
             */
            const META = createMeta({ type, cacheFor, accessedAt })

            store.dispatch(storageFetchAction(META, { ...action, type }))

            return { ...action, type }
          }
        }
      } else {
        if (storeMap.has(type)) {
          const cachedAt = Date.now()

          if (storeMetaMap.has(type)) {
            const storeMetaSet = storeMetaMap.get(type)

            storeMetaSet.forEach(({ type, cacheFor }) => {
              /*
               *  Store meta
               */
              const META = createMeta({ type, cacheFor, cachedAt })

              store.dispatch(storageStoreAction(META, { ...action, type }))
            })
          }

          const storeSet = storeMap.get(type)

          storeSet.forEach(({ type, cacheFor }) => {
            /*
             *  Fetch meta
             */
            const META = createMeta({ type, cacheFor, cachedAt })

            store.dispatch(storageStoreAction(META))
          })

          return next({ ...action, type })
        } else {
          if (clearMap.has(type)) {
            const clearSet = clearMap.get(type)

            clearSet.forEach(({ type }) => {
              if (fetchMetaMap.has(type)) {
                const fetchMetaSet = fetchMetaMap.get(type)

                fetchMetaSet.forEach(({ type }) => {
                  if (storeMap.has(type)) {
                    if (storeMetaMap.has(type)) {
                      const storeMetaSet = storeMetaMap.get(type)

                      storeMetaSet.forEach(({ type, cacheFor }) => {
                        /*
                         *  Store meta
                         */
                        const META = createMeta({ type, cacheFor })

                        store.dispatch(storageClearAction(META, { ...action, type }))
                      })
                    }

                    const storeSet = storeMap.get(type)

                    storeSet.forEach(({ type, cacheFor }) => {
                      /*
                       *  Fetch meta
                       */
                      const META = createMeta({ type, cacheFor })

                      store.dispatch(storageClearAction(META))
                    })
                  }
                })
              }
            })

            return next({ ...action, type })
          }
        }
      }

      return next({ ...action, type })
    }
  }

  return () => (next) => (action) => next(action)
}
