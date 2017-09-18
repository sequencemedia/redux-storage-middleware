import {
  storageFetchAction,
  storageStoreAction
} from 'redux-storage-middleware/actions'

const isStale = ({ cachedAt = 0, cacheFor = 0 }) => (cachedAt + cacheFor) < Date.now()
const isHardStorage = ({ cacheFor = 0 }) => cacheFor >= (1000 * 60 * 60 * 24)
const isSoftStorage = ({ cacheFor = 0 }) => cacheFor >= (1000 * 60 * 60) && cacheFor < (1000 * 60 * 60 * 24)

const filterFor = (t) => ({ type }) => type === t
const filterMetaFor = (t) => ({ meta: { type } }) => type === t
const map = ({ meta: { cacheFor = 0 } }) => cacheFor
const reduce = (a, { type, meta, meta: { cacheFor = 0 } }, index, array) => (
  Math.min.apply(array, array.filter(filterFor(type)).map(map)) === cacheFor ? a.concat({ type, meta }) : a
)
const dedupe = (a, { type, meta, meta: { type: t } }) => a.map(map).includes(t) ? a : a.concat({ type, meta })

const createMeta = (meta, isHardStorage = false, isSoftStorage = false) => ({
  ...meta,
  isHardStorage,
  isSoftStorage
})

const fetchMap = new Map()
const storeMap = new Map()

export default (array) => {
  if (Array.isArray(array)) {
    array
      .reduce(reduce, [])
      .forEach(({ type, meta = {} } = {}) => {
        if (type) {
          fetchMap.set(type, meta)
        }
      })

    array
      .reduce(dedupe, [])
      .forEach(({ meta: { type } = {}, meta } = {}) => {
        if (type) {
          storeMap.set(type, meta)
        }
      })
  }

  return (store) => (next) => ({ type, ...action } = {}) => {
    if (fetchMap.has(type)) {
      const meta = fetchMap.get(type)

      if (isStale(meta)) {
        return next({ ...action, type })
      } else {
        const filter = filterFor(type)

        array.filter(filter).forEach(({ meta }) => {
          const META = createMeta(meta, isHardStorage(meta), isSoftStorage(meta))

          store.dispatch(storageFetchAction(META))
        })
      }
    } else {
      if (storeMap.has(type)) {
        const meta = storeMap.get(type)

        if (isStale(meta)) {
          const META = createMeta(meta, isHardStorage(meta), isSoftStorage(meta))

          store.dispatch(storageStoreAction(META, { type, ...action }))

          const cachedAt = Date.now()

          storeMap.set(type, { ...meta, cachedAt })

          const filter = filterMetaFor(type)

          array.filter(filter).forEach(({ type }) => {
            if (fetchMap.has(type)) {
              const meta = fetchMap.get(type)

              fetchMap.set(type, { ...meta, cachedAt })
            }
          })

          return next({ ...action, type })
        } else {
          return next({ ...action, type })
        }
      } else {
        return next({ ...action, type })
      }
    }
  }
}
