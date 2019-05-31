import {
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import initialState from './initial-state'

const STATE = initialState()

export function storageFetch (state = STATE, action = {}) {
  const {
    meta: {
      isSoftStorage = false,
      isHardStorage = false
    } = {}
  } = action

  if (isSoftStorage || isHardStorage) {
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
  } else {
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
}

export function storageStore (state = STATE, action = {}) {
  const {
    meta: {
      isSoftStorage = false,
      isHardStorage = false
    } = {}
  } = action

  if (isSoftStorage || isHardStorage) {
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
  } else {
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
