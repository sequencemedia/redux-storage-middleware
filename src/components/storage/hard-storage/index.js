import Storage from 'redux-storage-middleware/components/storage'

const storage = ('localStorage' in global)
  ? global.localStorage
  : new Storage()

export default storage
