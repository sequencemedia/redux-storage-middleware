
import Storage from 'redux-storage-middleware/storage'

const storage = ('localStorage' in global)
  ? global.localStorage
  : new Storage()

export default storage
