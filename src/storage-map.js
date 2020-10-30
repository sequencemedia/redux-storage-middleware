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

/*
 * greater than or equal to one day
 */
export const isHardStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60 * 24)

/*
 *  greater than or equal to one hour and less than one day
 */
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
            meta
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

export const reduceFetch = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, index = 0, array = []) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor // min `cacheFor` among all metas for this FETCH `type`
      ? a
      : a.concat({ type, ...(meta ? { meta: { cacheFor } } : {}) }) // don't care about `type`
)

export const reduceFetchMeta = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, index = 0, array = []) => (
  a.filter(filterFor(type)).map(mapMetaType).includes(t)
    ? a
    : min(array.filter(filterFor(type)).filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor // ditto `reduceStoreMeta`
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const reduceStore = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, index = 0, array = []) => (
  a.filter(filterFor(type)).map(mapMetaType).includes(t)
    ? a
    : min(array.filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor // min `cacheFor` among all metas for this STORE `type`
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

export const reduceStoreMeta = (a = [], { type, meta, meta: { cacheFor = 0, type: t } = {} } = {}, index = 0, array = []) => (
  a.filter(filterFor(type)).map(mapMetaType).includes(t)
    ? a
    : min(array.filter(filterFor(type)).filter(filterMetaFor(t)).map(mapCacheFor)) !== cacheFor // ditto `reduceFetchMeta`
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

const {
  prototype: {
    hasOwnProperty: HASOWNPROPERTY
  }
} = Object

const getReduxStorage = ({ reduxStorage = {} } = {}) => reduxStorage
const getStateFromStore = (store) => getReduxStorage(store.getState())
const getStateForActionType = (type, { [type]: state = {} } = {}) => state
const hasStateForActionType = (type, state = {}) => HASOWNPROPERTY.call(state, type) // (type in state) // Object.prototype.hasOwnProperty.call(state, type) // state.hasOwnProperty(type) // type in state disliked by linter

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
      /**
       *  Is this action a FETCH `type`?
       */
      if (fetchMap.has(type)) {
        /**
         *  Yes, it is!
         *
         *  Capture a timestamp
         */
        const accessedAt = Date.now()

        const state = getStateFromStore(store)

        const {
          meta: {
            cacheFor, // read from state or the default from `fetchMap`
            cachedAt // read from state BUT DO NOT PROVIDE A DEFAULT
          } = fetchMap.get(type)
        } = getStateForActionType(type, state)

        if (isStale({ cacheFor, cachedAt })) {
          /**
           *  This FETCH type is stale:
           *
           *    Either because it has no `cachedAt` timestamp (so has never been cached)
           *    or because it has a `cachedAt` timestamp but exceeds its `cacheFor` duration
           *
           *  ALWAYS USE `createMeta`. ALWAYS! ALWAYS! ALWAYS!
           */
          const META = createMeta({ type, cacheFor, cachedAt: accessedAt, accessedAt })

          /**
           *  Dispatch an action to put this FETCH `type` into the cache
           */
          store.dispatch(storageWriteAction(META, { ...action, type }))

          /**
           *  Any configuration `meta` objects for this FETCH `type` have been transformed
           *  into a Set in the `fetchMetaMap` Map
           */
          if (fetchMetaMap.has(type)) {
            const fetchMetaSet = fetchMetaMap.get(type)

            /**
             *  Iterate through the configuration `meta` objects
             */
            fetchMetaSet.forEach(({ type }) => {
              /**
               *  This action has been cached if it exists in the store ...
               */
              if (hasStateForActionType(type, state)) {
                const {
                  meta: {
                    cacheFor,
                    cachedAt
                  } = {},
                  data
                } = getStateForActionType(type, state)

                const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

                /**
                 *  Dispatch an action to remove this `type` from the store
                 */
                store.dispatch(storageClearAction(META, data)) // META, data
              }
            })
          }

          /*
           *  Pass along to the next middleware
           */
          return next({ ...action, type })
        } else {
          /**
           *  ALWAYS USE `createMeta`. ALWAYS! ALWAYS! ALWAYS!
           */
          const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

          /**
           *  Dispatch an action to update this FETCH `type` in the cache
           */
          store.dispatch(storageFetchAction(META, { ...action, type })) // META, data

          /**
           *  Any configuration `meta` objects for this FETCH `type` have been transformed
           *  into a Set in the `fetchMetaMap` Map
           */
          if (fetchMetaMap.has(type)) {
            const fetchMetaSet = fetchMetaMap.get(type)

            /**
             *  Iterate through the configuration `meta` objects
             */
            fetchMetaSet.forEach(({ type }) => {
              /**
               *  This action has been cached if it exists in the store ...
               */
              if (hasStateForActionType(type, state)) {
                const {
                  meta: {
                    cacheFor,
                    cachedAt
                  } = {},
                  data
                } = getStateForActionType(type, state)

                /**
                 *  ALWAYS USE `createMeta`. ALWAYS! ALWAYS! ALWAYS!
                 */
                const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

                /**
                 *  Dispatch an action to update the `meta` attribute in the cache
                 */
                store.dispatch(storageFetchAction(META, data)) // META, data

                /**
                 *  The `data` attribute is the cached action
                 *
                 *  Replay that action!
                 */
                if (data) store.dispatch(data)
              }
            })
          }

          /*
           *  Do not pass along to the next middleware
           *
           *  This action has been intercepted and should not proceed through the
           *  middleware chain
           */
          return { ...action, type }
        }
      } else {
        /**
        *  No, it is not a FETCH `type`
        *
        *  Is this action a STORE `type`?
        */
        if (storeMap.has(type)) {
          /**
           *  Yes, it is!
           *
           *  Capture a timestamp
           */
          const accessedAt = Date.now()

          const state = getStateFromStore(store)

          const storeSet = storeMap.get(type)

          /**
           *  Each STORE `type` is a transformed configuration `meta` object belonging to a FETCH
           *
           *  But! A STORE might belong to several FETCH `type` objects, so `storeSet` is a Set
           *
           *  Iterate through the FETCH objects this STORE `type` might belong to (one to many)
           */
          storeSet.forEach(({ type, cacheFor }) => {
            /**
             *  This action has been cached if it exists in the store ...
             */
            if (hasStateForActionType(type, state)) {
              const {
                meta: {
                  cacheFor,
                  cachedAt
                },
                data
              } = getStateForActionType(type, state)

              /**
               *  ALWAYS USE `createMeta`. ALWAYS! ALWAYS! ALWAYS!
               */
              const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

              /**
               *  Dispatch an action to update the `meta` attribute in the cache
               */
              store.dispatch(storageStoreAction(META, data)) // META, data
            }
          })

          /**
           *  The configuration `meta` object of the FETCH `type` this STORE `type` belongs
           *  to has been transformed and put into the `storeMetaMap` Map (many to one)
           */
          if (storeMetaMap.has(type)) {
            const {
              meta: {
                cacheFor,
                cachedAt = accessedAt // read from state if state is available. Supply default otherwise
              } = storeMetaMap.get(type)
            } = getStateForActionType(type, state)

            /**
             *  ALWAYS USE `createMeta`. ALWAYS! ALWAYS! ALWAYS!
             */
            const META = createMeta({ type, cacheFor, cachedAt, accessedAt })

            /**
             *  Dispatch an action to update the `meta` attribute in the cache
             *  and make the `data` attribute the cached action
             */
            store.dispatch(storageStoreAction(META, { ...action, type })) // META, data
          }

          /*
           *  Pass along to the next middleware
           */
          return next({ ...action, type })
        }
      }

      /**
       *  It is neither a FETCH `type` nor a STORE `type`
       *
       *  ... so pass along to the next middleware
       */
      return next({ ...action, type })
    }
  }

  return () => (next) => (action) => next(action)
}
