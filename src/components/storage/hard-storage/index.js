import Storage from 'redux-storage-middleware/components/storage'

export default () => ('localStorage' in global)
  ? localStorage
  : new Storage()
