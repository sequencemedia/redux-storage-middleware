/* global sessionStorage */

import Storage from 'redux-storage-middleware/components/storage'

export default () => ('sessionStorage' in global)
  ? sessionStorage
  : new Storage()
