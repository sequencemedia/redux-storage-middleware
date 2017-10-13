export const STORAGE_COMPARE = 'STORAGE_COMPARE'
export const STORAGE_FETCH = 'STORAGE_FETCH'
export const STORAGE_STORE = 'STORAGE_STORE'
export const STORAGE_CLEAR = 'STORAGE_CLEAR'

export const storageCompareAction = (meta, data) => ({
  type: STORAGE_COMPARE,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})

export const storageFetchAction = (meta, data) => ({
  type: STORAGE_FETCH,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})

export const storageStoreAction = (meta, data) => ({
  type: STORAGE_STORE,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})

export const storageClearAction = (meta) => ({
  type: STORAGE_CLEAR,
  meta
})
