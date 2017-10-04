export const REDUX_STORAGE_COMPARISON = 'REDUX_STORAGE_COMPARISON'
export const REDUX_STORAGE_FETCH = 'REDUX_STORAGE_FETCH'
export const REDUX_STORAGE_STORE = 'REDUX_STORAGE_STORE'
export const REDUX_STORAGE_CLEAR = 'REDUX_STORAGE_CLEAR'

export const storageComparisonAction = (meta, data) => ({
  type: REDUX_STORAGE_COMPARISON,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})

export const storageFetchAction = (meta, data) => ({
  type: REDUX_STORAGE_FETCH,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})

export const storageStoreAction = (meta, data) => ({
  type: REDUX_STORAGE_STORE,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})

export const storageClearAction = (meta) => ({
  type: REDUX_STORAGE_CLEAR,
  meta
})
