import hardStorage from './hard-storage'
import softStorage from './soft-storage'

const fromObjectToString = (object) => JSON.stringify(object)
const fromStringToObject = (string) => JSON.parse(string)

const fetch = ({ meta, meta: { isHardStorage = false, isSoftStorage = false, type: t } }) => {
  if (isHardStorage) {
    const item = hardStorage.getItem(t)
    const {
      data
    } = fromStringToObject(item)
    store.dispatch(data)
  } else {
    if (isSoftStorage) {
      const item = softStorage.getItem(t)
      const {
        data
      } = fromStringToObject(item)
      store.dispatch(data)
    } else {
      const {
        reduxStorage: {
          [t]: {
            data
          }
        }
      } = store.getState()
      store.dispatch(data)
    }
  }
}

const store = ({ meta, meta: { isHardStorage = false, isSoftStorage = false, type: t }, data }) => {
  if (isHardStorage) {
    const item = fromObjectToString({ meta, data })
    hardStorage.setItem(t, item)
  } else {
    hardStorage.removeItem(t)
    if (isSoftStorage) {
      const item = fromObjectToString({ meta, data })
      softStorage.setItem(t, item)
    } else {
      softStorage.removeItem(t)
      store.dispatch({ type: 'REDUX_STORAGE', meta, data })
    }
  }
}

export default (store) => (next) => ({ type, ...action }) => {
  switch (type) {
    case 'REDUX_STORAGE_FETCH':
      return fetch(action)

    case 'REDUX_STORAGE_STORE':
      return store(action)

    default:
      return next({ ...action, type })
  }
}
