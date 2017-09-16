
import Storage from 'redux-storage-middleware/storage'

const storage = ('sessionStorage' in global)
  ? global.sessionStorage
  : new Storage()

export default storage
