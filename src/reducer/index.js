import {
  STORAGE_COMPARE,
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import initialState from './initial-state'

const STATE = initialState()

export function storageCompare (state = STATE, action = {}) {
  const {
    meta: {
      isSoftStorage = false,
      isHardStorage = false
    }
  } = action

  if (isSoftStorage || isHardStorage) {
    const {
      meta: {
        type,
        comparedAt = Date.now()
      }
    } = action

    const {
      [type]: {
        meta: stateMeta = {}
      } = {}
    } = state

    return { ...state, [type]: { meta: { ...stateMeta, comparedAt } } }
  } else {
    const {
      meta = {},
      meta: {
        type,
        comparedAt = Date.now()
      },
      data // = {}
    } = action

    const {
      [type]: {
        meta: stateMeta = {},
        data: stateData // = {}
      } = {}
    } = state

    return { ...state, [type]: { meta: { ...stateMeta, ...meta, type, comparedAt }, ...(data ? { data: { ...data, type } } : (stateData ? { data: { ...stateData, type } } : {})) } }
  }
}

export function storageFetch (state = STATE, action = {}) {
  const {
    meta: {
      isSoftStorage = false,
      isHardStorage = false
    }
  } = action

  if (isSoftStorage || isHardStorage) {
    const {
      meta: {
        type,
        accessedAt = Date.now()
      }
    } = action

    const {
      [type]: {
        meta: stateMeta = {}
      } = {}
    } = state

    return { ...state, [type]: { meta: { ...stateMeta, accessedAt } } }
  } else {
    const {
      meta = {},
      meta: {
        type,
        accessedAt = Date.now()
      },
      data // = {}
    } = action

    const {
      [type]: {
        meta: stateMeta = {},
        data: stateData // = {}
      } = {}
    } = state

    return { ...state, [type]: { meta: { ...stateMeta, ...meta, type, accessedAt }, ...(data ? { data: { ...data, type } } : (stateData ? { data: { ...stateData, type } } : {})) } }
  }
}

export function storageStore (state = STATE, action = {}) {
  const {
    meta: {
      isSoftStorage = false,
      isHardStorage = false
    }
  } = action

  if (isSoftStorage || isHardStorage) {
    const {
      meta: {
        type,
        cachedAt = Date.now()
      }
    } = action

    const {
      [type]: {
        meta: stateMeta = {}
      } = {}
    } = state

    return { ...state, [type]: { meta: { ...stateMeta, cachedAt } } }
  } else {
    const {
      meta = {},
      meta: {
        type,
        cachedAt = Date.now()
      },
      data // = {}
    } = action

    const {
      [type]: {
        meta: stateMeta = {},
        data: stateData // = {}
      } = {}
    } = state

    return { ...state, [type]: { meta: { ...stateMeta, ...meta, type, cachedAt }, ...(data ? { data: { ...data, type } } : (stateData ? { data: { ...stateData, type } } : {})) } }
  }
}

export function storageClear (state = STATE, { meta: { type } = {} } = {}) {
  if (type) delete state[type]

  return { ...state }
}

/**
 *  Storage Reducer
 *
 *  @param {Object} state Initial state
 *  @param {Object} action
 */
export default function storageReducer (state = STATE, action = {}) {
  const { type } = action

  switch (type) {
    case STORAGE_COMPARE:
      return storageCompare(state, action)

    case STORAGE_FETCH:
      return storageFetch(state, action)

    case STORAGE_STORE:
      return storageStore(state, action)

    case STORAGE_CLEAR:
      return storageClear(state, action)

    default:
      return state
  }
}
