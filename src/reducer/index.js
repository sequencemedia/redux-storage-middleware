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
            comparedAt = null
          }
        } = action

        const {
          [type]: {
            meta = {}
          } = {}
        } = state

        return { ...state, [type]: { meta: { ...meta, ...(comparedAt ? { comparedAt } : {}) } } }
      } else {
        const {
          meta: META = {},
          meta: {
            type
          },
          data: DATA = {}
        } = action

        const {
          [type]: {
            meta = {},
            data = {}
          } = {}
        } = state

        return { ...state, [type]: { meta: { ...meta, ...META, type }, data: { ...data, ...DATA, type } } }
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
            accessedAt = null
          }
        } = action

        const {
          [type]: {
            meta = {}
          } = {}
        } = state

        return { ...state, [type]: { meta: { ...meta, ...(accessedAt ? { accessedAt } : {}) } } }
      } else {
        const {
          meta: META = {},
          meta: {
            type
          },
          data: DATA = {}
        } = action

        const {
          [type]: {
            meta = {},
            data = {}
          } = {}
        } = state

        return { ...state, [type]: { meta: { ...meta, ...META, type }, data: { ...data, ...DATA, type } } }
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
            cachedAt = null
          }
        } = action

        const {
          [type]: {
            meta = {}
          } = {}
        } = state

        return { ...state, [type]: { meta: { ...meta, ...(cachedAt ? { cachedAt } : {}) } } }
      } else {
        const {
          meta: META = {},
          meta: {
            type
          },
          data: DATA = {}
        } = action

        const {
          [type]: {
            meta = {},
            data = {}
          } = {}
        } = state

        return { ...state, [type]: { meta: { ...meta, ...META }, data: { ...data, ...DATA } } }
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
