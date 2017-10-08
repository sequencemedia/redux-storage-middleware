import {
  REDUX_STORAGE_COMPARISON,
  REDUX_STORAGE_FETCH,
  REDUX_STORAGE_STORE,
  REDUX_STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import initialState from './initial-state'

const STATE = initialState()

/**
 *  Storage Reducer
 *
 *  @param {Object} state Initial state
 *  @param {Object} action
 */
export default function storageReducer (state = STATE, { type, ...action } = {}) {
  switch (type) {
    case REDUX_STORAGE_COMPARISON:
    {
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

    case REDUX_STORAGE_FETCH:
    {
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

    case REDUX_STORAGE_STORE:
    {
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

    case REDUX_STORAGE_CLEAR:
    {
      const {
        meta: {
          type
        }
      } = action

      if (type) delete state[type]

      return { ...state }
    }

    default:
      return state
  }
}
