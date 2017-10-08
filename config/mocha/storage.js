/* eslint-env mocha */
/* eslint no-unused-vars: 0, no-unused-expressions: 0, no-shadow: 0 */

import { expect } from 'chai'
import sinon from 'sinon'

// import configureStore from 'redux-mock-store'

import {
  REDUX_STORAGE_COMPARISON,
  REDUX_STORAGE_FETCH,
  REDUX_STORAGE_STORE,
  REDUX_STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import storage from 'redux-storage-middleware/storage'

describe('Redux Storage Middleware - Storage', () => {
  describe('Always', () => {
    it('is the middleware', () => {
      expect(storage).to.be.a('function')
    })
  })
})
