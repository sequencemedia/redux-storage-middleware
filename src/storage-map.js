import {
  storageCompareAction,
  storageFetchAction,
  storageStoreAction,
  storageClearAction
} from 'redux-storage-middleware/actions'

const isStale = ({ cachedAt = 0, cacheFor = 0 } = {}) => (cachedAt + cacheFor) < Date.now()
const isHardStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60 * 24)
const isSoftStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60) && cacheFor < (1000 * 60 * 60 * 24)
const hasComparator = ({ comparator = null } = {}) => comparator instanceof Function

const filterFor = (t) => ({ type } = {}) => type === t
const filterMetaFor = (t) => ({ meta: { type } = {} } = {}) => type === t // eslint-disable-line no-unused-vars

const mapType = ({ type } = {}) => type
const mapMetaType = ({ meta: { type } = {} } = {}) => type
const mapCacheFor = ({ meta: { cacheFor = 0 } = {} } = {}) => cacheFor
const mapCachedAt = ({ meta: { cachedAt = 0 } = {} } = {}) => cachedAt // eslint-disable-line no-unused-vars

const createIsHardStorage = (meta) => ({ ...meta, ...(isHardStorage(meta) ? { isHardStorage: true } : {}) })
const createIsSoftStorage = (meta) => ({ ...meta, ...(isSoftStorage(meta) ? { isSoftStorage: true } : {}) })

const createComparator = ({ comparator = null, ...meta } = {}) => ({ ...meta, ...(comparator ? { comparator } : {}) })
const createAccessedAt = ({ accessedAt = null, ...meta } = {}) => ({ ...meta, ...(accessedAt ? { accessedAt } : {}) })
const createCachedAt = ({ cachedAt = null, ...meta } = {}) => ({ ...meta, ...(cachedAt ? { cachedAt } : {}) })
const createCacheFor = ({ cacheFor = null, ...meta } = {}) => ({ ...meta, ...(cacheFor ? { cacheFor } : {}) })

const createMeta = (meta = {}) => (
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

const hasCacheFor = (value) => (!isNaN(value)) && !!value
const notCacheFor = (value) => isNaN(value) || !value

const filterFetch = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
const filterStore = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
const filterClear = ({ meta: { type, cacheFor = 0 } = {} } = {}) => notCacheFor(cacheFor)

const min = (values) => Math.min(...values)
const max = (values) => Math.max(...values) // eslint-disable-line no-unused-vars

const reduceFetch = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

const reduceStore = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

const reduceClear = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

const dedupeFetch = (a = [], { type, meta } = {}) => ( // eslint-disable-line no-unused-vars
  a.map(mapType).includes(type)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

const dedupeStore = (a = [], { type, meta, meta: { type: t } = {} } = {}) => (
  a.map(mapMetaType).includes(t)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

const dedupeClear = (a = [], { type, meta, meta: { type: t } = {} } = {}) => ( // eslint-disable-line no-unused-vars
  a.map(mapMetaType).includes(t)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

const filterHardStorage = ({ meta } = {}) => isHardStorage(meta)
const filterSoftStorage = ({ meta } = {}) => isSoftStorage(meta)
const filterStorage = ({ meta } = {}) => !( // NOT
  isHardStorage(meta) ||
  isSoftStorage(meta)
)

const filterNotFetchMap = ({ fetchMap = new Map() } = {}, { meta: { type } = {} } = {}) => !fetchMap.has(type)
const filterNotStoreMap = ({ storeMap = new Map() } = {}, { meta: { type } = {} } = {}) => !storeMap.has(type) // eslint-disable-line no-unused-vars
const filterIsUniqueMap = ({ fetchMap = new Map(), storeMap = new Map() } = {}, { meta: { type } = {} } = {}) => !( // NOT
  fetchMap.has(type) ||
  storeMap.has(type)
)

const putIntoFetchMap = ({ fetchMap = new Map() } = {}, { type, meta: { cacheFor, comparator } = {} } = {}) => {
  fetchMap.set(type, { type, cacheFor, ...(comparator instanceof Function ? { comparator } : {}) })
}

const putIntoStoreMap = ({ storeMap = new Map() } = {}, { type, meta: { type: TYPE, ...meta } = {} } = {}) => {
  const storeSet = storeMap.get(TYPE) || new Set()

  storeMap.set(
    TYPE,
    storeSet.add({ ...meta, type })
  )
}

const putIntoClearMap = ({ clearMap = new Map() } = {}, { type, meta: { type: TYPE, cacheFor, ...meta } = {} } = {}) => {
  const clearSet = clearMap.get(TYPE) || new Set()

  clearMap.set(
    TYPE,
    clearSet.add({ ...meta, type, ...(cacheFor ? { cacheFor } : {}), isNaN: isNaN(cacheFor) })
  )
}

const putIntoFetchMetaMap = ({ fetchMetaMap = new Map() } = {}, { type, meta: { cacheFor, ...meta } }) => {
  const fetchMetaSet = fetchMetaMap.get(type) || new Set()

  fetchMetaMap.set(
    type,
    fetchMetaSet.add({ ...meta, cacheFor })
  )
}

const putIntoStoreMetaMap = ({ storeMetaMap = new Map() } = {}, { meta: { type, cacheFor } }) => {
  const storeMetaSet = storeMetaMap.get(type) || new Set()

  storeMetaMap.set(
    type,
    storeMetaSet.add({ type, cacheFor })
  )
}

const filterStoreHardStorageArray = (array = []) => array.filter(filterHardStorage)
const filterStoreSoftStorageArray = (array = []) => array.filter(filterSoftStorage)
const filterStoreStorageArray = (array = []) => array.filter(filterStorage)

const filterFetchArray = (array = []) => array.filter(filterFetch)
const filterStoreArray = (array = []) => array.filter(filterStore)
const filterClearArray = (array = []) => array.filter(filterClear)

const filterNotFetchMapArray = (params = {}, array = []) => array.filter((item) => filterNotFetchMap(params, item))
const filterIsUniqueMapArray = (params = {}, array = []) => array.filter((item) => filterIsUniqueMap(params, item))

const createStoreMetaArray = (array = []) => (
  array
    .reduce(reduceStore, [])
    .reduce(dedupeStore, [])
)

function initialiseFetchMetaMap (params = {}, array = []) {
  array
    .forEach((item) => putIntoFetchMetaMap(params, item))
}

function initialiseStoreMetaMap (params = {}, array = []) {
  array
    .forEach((item) => putIntoStoreMetaMap(params, item))
}

function initialiseFetchHardStorage (params = {}, array = []) {
  filterStoreHardStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((item) => putIntoFetchMap(params, item))
}

function initialiseFetchSoftStorage (params = {}, array = []) {
  filterStoreSoftStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((item) => putIntoFetchMap(params, item))
}

function initialiseFetchStorage (params = {}, array = []) {
  filterStoreStorageArray(array)
    .reduce(reduceFetch, [])
    .forEach((item) => putIntoFetchMap(params, item))
}

function initialiseFetch (params = {}, array = []) {
  const fetchArray = filterFetchArray(array)

  initialiseFetchHardStorage(params, fetchArray)

  initialiseFetchSoftStorage(params, fetchArray)

  initialiseFetchStorage(params, fetchArray)
}

function initialiseStoreNotFetchMap (params = {}, array = []) {
  filterNotFetchMapArray(params, array)
    .reduce(reduceStore, [])
    .forEach((item) => putIntoStoreMap(params, item))
}

function initialiseStoreHardStorage (params = {}, array = []) {
  const hardStorageArray = filterStoreHardStorageArray(array)

  initialiseStoreNotFetchMap(params, hardStorageArray)

  const hardStorageMetaArray = createStoreMetaArray(hardStorageArray)

  initialiseFetchMetaMap(params, hardStorageMetaArray)

  initialiseStoreMetaMap(params, hardStorageMetaArray)
}

function initialiseStoreSoftStorage (params = {}, array = []) {
  const softStorageArray = filterStoreSoftStorageArray(array)

  initialiseStoreNotFetchMap(params, softStorageArray)

  const softStorageMetaArray = createStoreMetaArray(softStorageArray)

  initialiseFetchMetaMap(params, softStorageMetaArray)

  initialiseStoreMetaMap(params, softStorageMetaArray)
}

function initialiseStoreStorage (params = {}, array = []) {
  const storageArray = filterStoreStorageArray(array)

  initialiseStoreNotFetchMap(params, storageArray)

  const storageMetaArray = createStoreMetaArray(storageArray)

  initialiseFetchMetaMap(params, storageMetaArray)

  initialiseStoreMetaMap(params, storageMetaArray)
}

function initialiseStore (params = {}, array = []) {
  const storeArray = filterStoreArray(array)

  initialiseStoreHardStorage(params, storeArray)

  initialiseStoreSoftStorage(params, storeArray)

  initialiseStoreStorage(params, storeArray)
}

function initialiseClearIsUniqueMap (params = {}, array = []) {
  filterIsUniqueMapArray(params, array)
    .reduce(reduceClear, [])
    .forEach((item) => putIntoClearMap(params, item))
}

function initialiseClear (params = {}, array = []) {
  const clearArray = filterClearArray(array)

  initialiseClearIsUniqueMap(params, clearArray)
}

function initialise (params = {}, array = []) {
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

  return () => (next) => (action) => next(action);
}
