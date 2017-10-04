import {
  storageComparisonAction,
  storageFetchAction,
  storageStoreAction,
  storageClearAction
} from 'redux-storage-middleware/actions'

const isStale = ({ cachedAt = 0, cacheFor = 0 } = {}) => (cachedAt + cacheFor) < Date.now()
const isHardStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60 * 24)
const isSoftStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60) && cacheFor < (1000 * 60 * 60 * 24)
const hasComparator = ({ comparator }) => !!comparator // instanceof Function

const filterFor = (t) => ({ type } = {}) => type === t
const filterMetaFor = (t) => ({ meta: { type } = {} } = {}) => type === t // eslint-disable-line no-unused-vars

const mapType = ({ type } = {}) => type
const mapMetaType = ({ meta: { type } = {} } = {}) => type
const mapCacheFor = ({ meta: { cacheFor = 0 } = {} } = {}) => cacheFor
const mapCachedAt = ({ meta: { cachedAt = 0 } = {} } = {}) => cachedAt // eslint-disable-line no-unused-vars

const createIsHardStorage = (meta) => (
  isHardStorage(meta)
    ? ({ ...meta, isHardStorage: true })
    : ({ ...meta })
)

const createIsSoftStorage = (meta) => (
  isSoftStorage(meta)
    ? ({ ...meta, isSoftStorage: true })
    : ({ ...meta })
)

const createComparator = ({ comparator = null, ...meta }) => ({ ...meta, ...(comparator ? { comparator } : {}) })
const createAccessedAt = ({ accessedAt = null, ...meta }) => ({ ...meta, ...(accessedAt ? { accessedAt } : {}) })
const createCachedAt = ({ cachedAt = null, ...meta }) => ({ ...meta, ...(cachedAt ? { cachedAt } : {}) })
const createCacheFor = ({ cacheFor = null, ...meta }) => ({ ...meta, ...(cacheFor ? { cacheFor } : {}) })

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

const fetchMap = new Map()
const storeMap = new Map()
const fetchMetaMap = new Map()
const storeMetaMap = new Map()
const clearMap = new Map()

const hasCacheFor = (value) => (!isNaN(value)) && !!value
const notCacheFor = (value) => isNaN(value) || !value

const fetchFilter = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
const storeFilter = ({ meta: { type, cacheFor = 0 } = {} } = {}) => hasCacheFor(cacheFor)
const clearFilter = ({ meta: { type, cacheFor = 0 } = {} } = {}) => notCacheFor(cacheFor)

const min = (values) => Math.min(...values)
const max = (values) => Math.max(...values) // eslint-disable-line no-unused-vars

const fetchReduce = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

const storeReduce = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

const clearReduce = (a = [], { type, meta, meta: { cacheFor = 0 } = {} } = {}, i, array) => (
  a.map(mapType).includes(type)
    ? a
    : min(array.filter(filterFor(type)).map(mapCacheFor)) !== cacheFor
      ? a
      : a.concat({ type, ...(meta ? { meta } : {}) })
)

const fetchDedupe = (a = [], { type, meta } = {}) => ( // eslint-disable-line no-unused-vars
  a.map(mapType).includes(type)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

const storeDedupe = (a = [], { type, meta, meta: { type: t } = {} } = {}) => (
  a.map(mapMetaType).includes(t)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

const clearDedupe = (a = [], { type, meta, meta: { type: t } = {} } = {}) => ( // eslint-disable-line no-unused-vars
  a.map(mapMetaType).includes(t)
    ? a
    : a.concat({ type, ...(meta ? { meta } : {}) })
)

const notFetchMapFilter = ({ meta: { type } }) => !fetchMap.has(type)
const notStoreMapFilter = ({ meta: { type } }) => !storeMap.has(type) // eslint-disable-line no-unused-vars
const isUniqueMapFilter = ({ meta: { type } }) => !(fetchMap.has(type) || storeMap.has(type))

const hardStorageFilter = ({ meta }) => isHardStorage(meta)
const softStorageFilter = ({ meta }) => isSoftStorage(meta)
const storageFilter = ({ meta }) => !(isHardStorage(meta) || isSoftStorage(meta))

const putIntoFetchMap = ({ type, meta: { cacheFor, comparator } = {} } = {}) => {
  fetchMap.set(type, { type, cacheFor, ...(comparator instanceof Function ? { comparator } : {}) })
}

const putIntoStoreMap = ({ type, meta: { type: TYPE, ...meta } = {} } = {}) => {
  const storeSet = storeMap.get(TYPE) || new Set()

  storeMap.set(
    TYPE,
    storeSet.add({ ...meta, type })
  )
}

const putIntoClearMap = ({ type, meta: { type: TYPE, cacheFor, ...meta } = {} } = {}) => {
  const clearSet = clearMap.get(TYPE) || new Set()

  clearMap.set(
    TYPE,
    clearSet.add({ ...meta, type, ...(cacheFor ? { cacheFor } : {}), isNaN: isNaN(cacheFor) })
  )
}

const putIntoFetchMetaMap = ({ type, meta: { cacheFor, ...meta } }) => {
  const fetchMetaSet = fetchMetaMap.get(type) || new Set()

  fetchMetaMap.set(
    type,
    fetchMetaSet.add({ ...meta, cacheFor })
  )
}

const putIntoStoreMetaMap = ({ meta: { type, cacheFor } }) => {
  const storeMetaSet = storeMetaMap.get(type) || new Set()

  storeMetaMap.set(
    type,
    storeMetaSet.add({ type, cacheFor })
  )
}

export default (array) => {
  if (Array.isArray(array)) {
    const fetchArray = array
      .filter(fetchFilter)

    const storeArray = array
      .filter(storeFilter)

    const clearArray = array
      .filter(clearFilter)

    const storeHardStorage = storeArray
      .filter(hardStorageFilter)

    const storeSoftStorage = storeArray
      .filter(softStorageFilter)

    const storeStorage = storeArray
      .filter(storageFilter)

    fetchArray
      .filter(hardStorageFilter)
      .reduce(fetchReduce, [])
      .forEach(putIntoFetchMap)

    fetchArray
      .filter(softStorageFilter)
      .reduce(fetchReduce, [])
      .forEach(putIntoFetchMap)

    fetchArray
      .filter(storageFilter)
      .reduce(fetchReduce, [])
      .forEach(putIntoFetchMap)

    storeHardStorage
      .filter(notFetchMapFilter)
      .reduce(storeReduce, [])
      .forEach(putIntoStoreMap)

    storeSoftStorage
      .filter(notFetchMapFilter)
      .reduce(storeReduce, [])
      .forEach(putIntoStoreMap)

    storeStorage
      .filter(notFetchMapFilter)
      .reduce(storeReduce, [])
      .forEach(putIntoStoreMap)

    storeHardStorage
      .reduce(storeReduce, [])
      .reduce(storeDedupe, [])
      .forEach(putIntoFetchMetaMap)

    storeSoftStorage
      .reduce(storeReduce, [])
      .reduce(storeDedupe, [])
      .forEach(putIntoFetchMetaMap)

    storeStorage
      .reduce(storeReduce, [])
      .reduce(storeDedupe, [])
      .forEach(putIntoFetchMetaMap)

    storeHardStorage
      .reduce(storeReduce, [])
      .reduce(storeDedupe, [])
      .forEach(putIntoStoreMetaMap)

    storeSoftStorage
      .reduce(storeReduce, [])
      .reduce(storeDedupe, [])
      .forEach(putIntoStoreMetaMap)

    storeStorage
      .reduce(storeReduce, [])
      .reduce(storeDedupe, [])
      .forEach(putIntoStoreMetaMap)

    clearArray
      .filter(isUniqueMapFilter)
      .reduce(clearReduce, [])
      .forEach(putIntoClearMap)
  }

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

        const META = createMeta({
          ...meta,
          cacheFor,
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

        store.dispatch(storageComparisonAction(META, { ...action, type }))

        return { ...action, type }
      } else {
        const {
          cacheFor
        } = defaultMeta

        const META = createMeta({ ...meta, cacheFor })

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
