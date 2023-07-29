export const STORAGE_FETCH = 'STORAGE_FETCH'
export const STORAGE_STORE = 'STORAGE_STORE'
export const STORAGE_WRITE = 'STORAGE_WRITE'
export const STORAGE_CLEAR = 'STORAGE_CLEAR'

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

export const storageWriteAction = (meta, data) => ({
  type: STORAGE_WRITE,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})

export const storageClearAction = (meta, data) => ({
  type: STORAGE_CLEAR,
  ...(meta ? { meta } : {}),
  ...(data ? { data } : {})
})
