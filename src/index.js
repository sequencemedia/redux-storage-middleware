
import hardStorage from './hard-storage'
import softStorage from './soft-storage'

const REDUX_STORAGE = 'reduxStorage'

const fromObjectToString = (object) => JSON.stringify(object)
const fromStringToObject = (string) => JSON.parse(string)

const isHardStorage = ({ ttl }) => false
const isSoftStorage = ({ ttl }) => false

export const fetch = (store) => (next) => ({ type, ...action }) => {
  if (type === 'REDUX_STORAGE_FETCH') {
    const {
      meta,
      meta: {
        type: t
      }
    } = action

    if (isHardStorage(meta)) {
      const item = hardStorage.getItem(t)
      const {
        data
      } = fromStringToObject(item)
      store.dispatch(data)
    } else {
      if (isSoftStorage(meta)) {
        const item = softStorage.getItem(t)
        const {
          data
        } = fromStringToObject(item)
        store.dispatch(data)
      } else {
        const {
          [REDUX_STORAGE]: {
            [t]: {
              data
            }
          }
        } = store.getState()
        store.dispatch(data)
      }
    }
  }

  return next({ ...action, type })
}

export const store = (store) => (next) => ({ type, ...action }) => {
  if (type === 'REDUX_STORAGE_STORE') {
    const {
      meta,
      meta: {
        type: t
      },
      data
    } = action

    if (isHardStorage(meta)) {
      const item = fromObjectToString({ meta, data })
      hardStorage.setItem(t, item)
    } else {
      hardStorage.removeItem(t)
      if (isSoftStorage(meta)) {
        const item = fromObjectToString({ meta, data })
        softStorage.setItem(t, item)
      } else {
        softStorage.removeItem(t)
        store.dispatch({ type: 'REDUX_STORAGE', meta, data })
      }
    }
  }

  return next({ ...action, type })
}
