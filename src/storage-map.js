import {
  storageFetchAction,
  storageStoreAction,
  storageClearAction
} from 'redux-storage-middleware/actions'

const isStale = ({ cachedAt = 0, cacheFor = 0 } = {}) => (cachedAt + cacheFor) < Date.now()
const isHardStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60 * 24)
const isSoftStorage = ({ cacheFor = 0 } = {}) => cacheFor >= (1000 * 60 * 60) && cacheFor < (1000 * 60 * 60 * 24)

const filter = ({ meta: { cacheFor = 0 } = {} }) => !!cacheFor
const filterFor = (t) => ({ type } = {}) => type === t
const filterMetaFor = (t) => ({ meta: { type } = {} } = {}) => type === t
const map = ({ meta: { cacheFor = 0 } } = {}) => cacheFor
const reduce = (a, { type, meta, meta: { cacheFor = 0 } = {} } = {}, index, array) => (
  Math.min(...array.filter(filterFor(type)).map(map)) === cacheFor ? a.concat({ type, ...(meta ? { meta } : {}) }) : a
)
const dedupe = (a, { meta: { type: t } = {}, type, meta } = {}) => a.map(map).includes(t) ? a : a.concat({ type, ...(meta ? { meta } : {}) })

const createAccessedAt = (meta = {}, accessedAt) => ({ ...meta, ...(accessedAt ? { accessedAt } : {}) })
const createCachedAt = (meta = {}, cachedAt) => ({ ...meta, ...(cachedAt ? { cachedAt } : {}) })
const createCacheFor = (meta = {}, cacheFor) => ({ ...meta, ...(cacheFor ? { cacheFor } : {}) })

/*
const createIsHardStorage = ({ isHardStorage = false, isSoftStorage = false, ...meta }) => ({
  ...meta,
  ...(isHardStorage && !isSoftStorage ? { isHardStorage } : {})
})

const createIsSoftStorage = ({ isSoftStorage = false, isHardStorage = false, ...meta }) => ({
  ...meta,
  ...(isSoftStorage && !isHardStorage ? { isSoftStorage } : {})
})
*/

const createMeta = (meta, isHardStorage = false, isSoftStorage = false) => ({
  ...meta,
  ...(isHardStorage ? { isHardStorage } : {}),
  ...(isSoftStorage ? { isSoftStorage } : {})
})

const fetchMap = new Map()
const storeMap = new Map()

export default (array) => {
  if (Array.isArray(array)) {
    array
      .filter(filter).reduce(reduce, [])
      .forEach(({ type, meta: { cacheFor = 0 } = {} } = {}) => {
        if (type) {
          fetchMap.set(type, { type, cacheFor })
        }
      })

    array
      .reduce(dedupe, [])
      .forEach(({ meta: { type, cacheFor = 0 } = {}, meta = {} } = {}) => {
        if (type) {
          storeMap.set(type, { ...meta, cacheFor })
        }
      })
  }

  return (store) => (next) => ({ type, ...action } = {}) => {
    if (fetchMap.has(type)) {
      const {
        reduxStorage: {
          [type]: {
            meta = fetchMap.get(type)
          } = {}
        } = {}
      } = store.getState()

      const {
        cacheFor
      } = fetchMap.get(type)

      const META = createMeta(createCacheFor(meta, cacheFor))

      if (isStale(META)) {
        return next({ ...action, type })
      } else {
        array
          .filter(filterFor(type)).filter(filter)
          .forEach(({ meta }) => {
            const META = createMeta(createAccessedAt(meta, Date.now()), isHardStorage(meta), isSoftStorage(meta))

            store.dispatch(storageFetchAction(META))
          })
      }
    } else {
      if (storeMap.has(type)) {
        const {
          reduxStorage: {
            [type]: {
              meta = storeMap.get(type)
            } = {}
          } = {}
        } = store.getState()

        const cachedAt = Date.now()

        const {
          cacheFor = 0
        } = storeMap.get(type)

        if (cacheFor) {
          /*
           *  Store Map
           */
          const META = createMeta(createCacheFor(createCachedAt({ ...meta, type }, cachedAt), cacheFor), isHardStorage(meta), isSoftStorage(meta))

          store.dispatch(storageStoreAction(META, { type, ...action }))

          array
            /*
             *  The set of items with this meta type
             */
            .filter(filterMetaFor(type))
            /*
             *  And are cachable
             */
            .filter(filter)
            .forEach(({ type }) => {
              const {
                reduxStorage: {
                  [type]: {
                    meta = fetchMap.get(type)
                  } = {}
                } = {}
              } = store.getState()

              const {
                cacheFor
              } = fetchMap.get(type)

              /*
               *  Fetch Map
               */
              const META = createMeta(createCacheFor(createCachedAt({ ...meta, type }, cachedAt), cacheFor), isHardStorage(meta), isSoftStorage(meta))

              store.dispatch(storageStoreAction(META))
            })
        } else {
          array
            /*
             *  The set of items with this meta type
             */
            .filter(filterMetaFor(type))
            .forEach(({ type }) => {
              array
                /*
                 *  The set of items with this type
                 */
                .filter(filterFor(type))
                /*
                 *  And are cachable
                 */
                .filter(filter)
                .forEach(({ type, meta }, index, array) => {
                  /*
                   *  Fetch Map
                   */
                  const META = createMeta({ type }, isHardStorage(meta), isSoftStorage(meta))

                  store.dispatch(storageClearAction(META))

                  array
                    .forEach(({ meta: { type } = {}, meta }) => {
                      /*
                       *  Store Map
                       */
                      const META = createMeta({ type }, isHardStorage(meta), isSoftStorage(meta))

                      store.dispatch(storageClearAction(META))
                    })
                })
            })
        }

        return next({ ...action, type })
      } else {
        return next({ ...action, type })
      }
    }
  }
}
