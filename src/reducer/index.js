import {
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_WRITE,
  STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import initialState from './initial-state'

const STATE = initialState()

export function storageWrite (state = {}, action = {}) {
  const {
    meta = {},
    meta: {
      type
    } = {},
    data
  } = action

  const {
    [type]: {
      meta: stateMeta = {},
      data: stateData
    } = {}
  } = state

  return { ...state, [type]: { meta: { ...stateMeta, ...meta, type }, ...(stateData ? { data: { ...stateData, ...(data || {}) } } : (data ? { data } : {})) } }
}

export function storageClear (state = {}, { meta: { type } = {} } = {}) {
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
    case STORAGE_FETCH:
      return storageWrite(state, action)

    case STORAGE_STORE:
      return storageWrite(state, action)

    case STORAGE_WRITE:
      return storageWrite(state, action)

    case STORAGE_CLEAR:
      return storageClear(state, action)

    default:
      return state
  }
}
