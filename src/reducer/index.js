import {
  REDUX_STORAGE_STATE,
  REDUX_STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

/**
 *  Storage Reducer
 *
 *  @param {Object} state Initial state
 *  @param {Object} action
 */
export default function storageReducer (state = {}, { type, ...action } = {}) {
  switch (type) {
    case REDUX_STORAGE_STATE:
    {
      const {
        meta,
        meta: {
          type: t
        },
        data
      } = action

      return { ...state, [t]: { meta, data } }
    }

    case REDUX_STORAGE_CLEAR:
      return { }

    default:
      return state
  }
}
