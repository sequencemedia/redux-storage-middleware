import {
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
  console.log('storageReducer()', { type })

  switch (type) {
    case REDUX_STORAGE_FETCH:
    {
      const {
        meta: META = {},
        meta: {
          type
        }
      } = action

      const {
        [type]: TYPE = {},
        [type]: {
          meta = {}
        } = {}
      } = state

      return { ...state, [type]: { ...(TYPE || {}), meta: { ...meta, ...META } } }
    }

    case REDUX_STORAGE_STORE:
    {
      const {
        meta: META = {},
        meta: {
          type
        },
        data
      } = action

      const {
        [type]: {
          meta = {}
        } = {}
      } = state

      console.log(REDUX_STORAGE_STORE, type)
      return { ...state, [type]: { meta: { ...meta, ...META }, ...(data ? { data } : {}) } }
    }

    case REDUX_STORAGE_CLEAR:
    {
      const {
        meta: {
          type
        }
      } = action

      console.log(REDUX_STORAGE_CLEAR, type)
      if (type) delete state[type]
      return { ...state }
    }

    default:
      return state
  }
}
