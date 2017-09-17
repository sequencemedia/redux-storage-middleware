/**
 *  Storage Reducer
 *
 *  @param {Object} state Initial state
 *  @param {Object} action
 */
export default function storageReducer (state = {}, { type, ...action } = {}) {
  switch (type) {
    case 'REDUX_STORAGE':
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

    default:
      return state
  }
}
