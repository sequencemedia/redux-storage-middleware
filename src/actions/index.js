export const REDUX_STORAGE_FETCH = 'REDUX_STORAGE_FETCH'
export const REDUX_STORAGE_STORE = 'REDUX_STORAGE_STORE'
export const REDUX_STORAGE_STATE = 'REDUX_STORAGE_STATE'
export const REDUX_STORAGE_CLEAR = 'REDUX_STORAGE_CLEAR'

export const storageFetchAction = (meta) => ({
  type: REDUX_STORAGE_FETCH,
  meta
})

export const storageStoreAction = (meta, data) => ({
  type: REDUX_STORAGE_STORE,
  meta,
  data
})

export const storageStateAction = (meta, data) => ({
  type: REDUX_STORAGE_STATE,
  meta,
  data
})

export const storageClearAction = (meta, data) => ({
  type: REDUX_STORAGE_CLEAR
})
