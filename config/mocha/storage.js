/* eslint-env mocha */
/* eslint no-unused-vars: 0, no-unused-expressions: 0, no-shadow: 0 */

import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import configureStore from 'redux-mock-store'

import Storage from 'redux-storage-middleware/components/storage'

import {
  REDUX_STORAGE_COMPARISON,
  REDUX_STORAGE_FETCH,
  REDUX_STORAGE_STORE,
  REDUX_STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import storage from 'redux-storage-middleware/storage'

chai.use(sinonChai)

describe('Redux Storage Middleware - Storage', () => {
  let store

  const ONE_SECOND = 1000
  const ONE_MINUTE = ONE_SECOND * 60
  const ONE_HOUR = ONE_MINUTE * 60
  const ONE_DAY = ONE_HOUR * 24

  const HARD_CACHE_FOR = ONE_DAY // (1000 * 60 * 60 * 24)
  const SOFT_CACHE_FOR = ONE_HOUR // (1000 * 60 * 60)
  const STATE_CACHE_FOR = ONE_MINUTE // (1000 * 60)

  const HARD_COMPARISON = 'HARD_COMPARISON'
  const HARD_FETCH = 'HARD_FETCH'
  const HARD_STORE = 'HARD_STORE'
  const HARD_CLEAR = 'HARD_CLEAR'

  const SOFT_COMPARISON = 'SOFT_COMPARISON'
  const SOFT_FETCH = 'SOFT_FETCH'
  const SOFT_STORE = 'SOFT_STORE'
  const SOFT_CLEAR = 'SOFT_CLEAR'

  const STATE_COMPARISON = 'STATE_COMPARISON'
  const STATE_FETCH = 'STATE_FETCH'
  const STATE_STORE = 'STATE_STORE'
  const STATE_CLEAR = 'STATE_CLEAR'

  beforeEach(() => {
    sinon.stub(Storage.prototype, 'getItem').returns(null)
    sinon.stub(Storage.prototype, 'setItem')
    sinon.stub(Storage.prototype, 'removeItem')
  })

  afterEach(() => {
    Storage.prototype.getItem.restore()
    Storage.prototype.setItem.restore()
    Storage.prototype.removeItem.restore()
  })

  describe('Always', () => {
    it('is the middleware', () => {
      expect(storage).to.be.a('function')
    })
  })

  describe('Hard storage', () => {
    describe('Compare', () => {
      let action

      const isHardStorage = true

      describe('With state', () => {
        beforeEach(() => {
          Storage.prototype.getItem.returns('{"type":"HARD_STORAGE","data":{"type":"HARD_COMPARISON","data":{}}}')
        })

        describe('Always', () => {
          let store
          let action

          let NOW

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            NOW = Date.now()

            sinon.stub(Date, 'now')
              .returns(NOW)

            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: HARD_COMPARISON, cacheFor: HARD_CACHE_FOR, cachedAt: NOW - ONE_DAY, isHardStorage, comparator: COMPARATOR, then: THEN }, data: { type: HARD_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('gets the meta property type from storage', () => {
            expect(Storage.prototype.getItem)
              .to.have.been.calledWith(HARD_COMPARISON)
          })

          it('invokes the "comparator" function', () => {
            expect(COMPARATOR)
              .to.have.been.calledWith({ type: HARD_COMPARISON, data: {} }, { type: HARD_COMPARISON, data: {} }, { cacheFor: HARD_CACHE_FOR, cachedAt: new Date(NOW - ONE_DAY) })
          })
        })

        describe('When the comparator returns true', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: HARD_COMPARISON, cacheFor: HARD_CACHE_FOR, isHardStorage, comparator: COMPARATOR, then: THEN }, data: { type: HARD_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('sets the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .to.have.been.calledWith(HARD_COMPARISON, `{"meta":{"cacheFor":${HARD_CACHE_FOR}},"data":{"type":"HARD_COMPARISON","data":{}}}`)
          })

          it('invokes the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: HARD_COMPARISON, data: {} }])
          })

          it('does not invoke the "then" function with the data action', () => {
            expect(THEN)
              .not.to.have.been.called
          })
        })

        describe('When the comparator returns false', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: HARD_COMPARISON, cacheFor: HARD_CACHE_FOR, isHardStorage, comparator: COMPARATOR, then: THEN }, data: { type: HARD_COMPARISON, data: {} } }

            COMPARATOR.returns(false)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('does not invoke the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(0)

            expect(actions)
              .to.deep.equal([])
          })

          it('invokes the "then" function with the data action', () => {
            expect(THEN)
              .to.have.been.calledWith({ type: HARD_COMPARISON, data: {} })
          })
        })
      })

      describe('Without state', () => {
        beforeEach(() => {
          Storage.prototype.getItem.returns(null)
        })

        describe('Always', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: HARD_COMPARISON, cacheFor: HARD_CACHE_FOR, isHardStorage, comparator: COMPARATOR, then: THEN }, data: { type: HARD_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('gets the meta property type from storage', () => {
            expect(Storage.prototype.getItem)
              .to.have.been.calledWith(HARD_COMPARISON)
          })

          it('invokes the "comparator" function', () => {
            expect(COMPARATOR)
              .to.have.been.calledWith({}, { type: HARD_COMPARISON, data: {} }, { cacheFor: HARD_CACHE_FOR })
          })
        })

        describe('When the comparator returns true', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: HARD_COMPARISON, cacheFor: HARD_CACHE_FOR, isHardStorage, comparator: COMPARATOR, then: THEN }, data: { type: HARD_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('sets the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .to.have.been.calledWith(HARD_COMPARISON, `{"meta":{"cacheFor":${HARD_CACHE_FOR}},"data":{"type":"HARD_COMPARISON","data":{}}}`)
          })

          it('invokes the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: HARD_COMPARISON, data: {} }])
          })

          it('does not invoke the "then" function with the data action', () => {
            expect(THEN)
              .not.to.have.been.called
          })
        })

        describe('When the comparator returns false', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: HARD_COMPARISON, cacheFor: HARD_CACHE_FOR, isHardStorage, comparator: COMPARATOR, then: THEN }, data: { type: HARD_COMPARISON, data: {} } }

            COMPARATOR.returns(false)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('does not invoke the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(0)

            expect(actions)
              .to.deep.equal([])
          })

          it('invokes the "then" function with the data action', () => {
            expect(THEN)
              .to.have.been.calledWith({ type: HARD_COMPARISON, data: {} })
          })
        })
      })
    })

    describe('Fetch', () => {
      const isHardStorage = true
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(`{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt - ONE_DAY}},"data":{"type":"HARD_FETCH"}}`)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(HARD_FETCH)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_FETCH, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(2)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage } })
        })

        it('dispatches the hard storage data action', () => {
          expect(actions.length).to.eql(2)

          expect(actions)
            .to.deep.include({ type: HARD_FETCH })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(HARD_FETCH)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_FETCH, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage } })
        })

        it('does not dispatch the hard storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: HARD_FETCH })
        })
      })
    })

    describe('Store', () => {
      const isHardStorage = true
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(`{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt - ONE_DAY}},"data":{"type":"HARD_STORE"}}`)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(HARD_STORE)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_STORE, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } })
        })

        it('does not dispatch the hard storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: HARD_STORE, data: {} })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(HARD_STORE)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_STORE, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } })
        })

        it('does not dispatch the hard storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: HARD_STORE, data: {} })
        })
      })
    })

    describe('Clear', () => {
      const isHardStorage = true

      let store
      let action
      let actions

      beforeEach(() => {
        store = configureStore([ storage ])({})

        action = { type: REDUX_STORAGE_CLEAR, meta: { type: HARD_CLEAR, isHardStorage } }

        store.dispatch(action)

        actions = store.getActions()
      })

      it('removes the meta property type from storage', () => {
        expect(Storage.prototype.removeItem)
          .to.have.been.calledWith(HARD_CLEAR)
      })

      it('invokes the "next" middleware with the clear action', () => {
        expect(actions.length).to.eql(1)

        expect(actions)
          .to.deep.include({ type: REDUX_STORAGE_CLEAR, meta: { type: HARD_CLEAR, isHardStorage } })
      })
    })
  })

  describe('Soft storage', () => {
    describe('Compare', () => {
      let action

      const isSoftStorage = true

      describe('With state', () => {
        beforeEach(() => {
          Storage.prototype.getItem.returns('{"type":"SOFT_STORAGE","data":{"type":"SOFT_COMPARISON","data":{}}}')
        })

        describe('Always', () => {
          let store
          let action

          let NOW

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            NOW = Date.now()

            sinon.stub(Date, 'now')
              .returns(NOW)

            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: SOFT_COMPARISON, cacheFor: SOFT_CACHE_FOR, cachedAt: NOW - ONE_DAY, isSoftStorage, comparator: COMPARATOR, then: THEN }, data: { type: SOFT_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('gets the meta property type from storage', () => {
            expect(Storage.prototype.getItem)
              .to.have.been.calledWith(SOFT_COMPARISON)
          })

          it('invokes the "comparator" function', () => {
            expect(COMPARATOR)
              .to.have.been.calledWith({ type: SOFT_COMPARISON, data: {} }, { type: SOFT_COMPARISON, data: {} }, { cacheFor: SOFT_CACHE_FOR, cachedAt: new Date(NOW - ONE_DAY) })
          })
        })

        describe('When the comparator returns true', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: SOFT_COMPARISON, cacheFor: SOFT_CACHE_FOR, isSoftStorage, comparator: COMPARATOR, then: THEN }, data: { type: SOFT_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('sets the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .to.have.been.calledWith(SOFT_COMPARISON, `{"meta":{"cacheFor":${SOFT_CACHE_FOR}},"data":{"type":"SOFT_COMPARISON","data":{}}}`)
          })

          it('invokes the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: SOFT_COMPARISON, data: {} }])
          })

          it('does not invoke the "then" function with the data action', () => {
            expect(THEN)
              .not.to.have.been.called
          })
        })

        describe('When the comparator returns false', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: SOFT_COMPARISON, cacheFor: SOFT_CACHE_FOR, isSoftStorage, comparator: COMPARATOR, then: THEN }, data: { type: SOFT_COMPARISON, data: {} } }

            COMPARATOR.returns(false)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('does not invoke the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(0)

            expect(actions)
              .to.deep.equal([])
          })

          it('invokes the "then" function with the data action', () => {
            expect(THEN)
              .to.have.been.calledWith({ type: SOFT_COMPARISON, data: {} })
          })
        })
      })

      describe('Without state', () => {
        beforeEach(() => {
          Storage.prototype.getItem.returns(null)
        })

        describe('Always', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: SOFT_COMPARISON, cacheFor: SOFT_CACHE_FOR, isSoftStorage, comparator: COMPARATOR, then: THEN }, data: { type: SOFT_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('gets the meta property type from storage', () => {
            expect(Storage.prototype.getItem)
              .to.have.been.calledWith(SOFT_COMPARISON)
          })

          it('invokes the "comparator" function', () => {
            expect(COMPARATOR)
              .to.have.been.calledWith({}, { type: SOFT_COMPARISON, data: {} }, { cacheFor: SOFT_CACHE_FOR })
          })
        })

        describe('When the comparator returns true', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: SOFT_COMPARISON, cacheFor: SOFT_CACHE_FOR, isSoftStorage, comparator: COMPARATOR, then: THEN }, data: { type: SOFT_COMPARISON, data: {} } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('sets the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .to.have.been.calledWith(SOFT_COMPARISON, `{"meta":{"cacheFor":${SOFT_CACHE_FOR}},"data":{"type":"SOFT_COMPARISON","data":{}}}`)
          })

          it('invokes the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: SOFT_COMPARISON, data: {} }])
          })

          it('does not invoke the "then" function with the data action', () => {
            expect(THEN)
              .not.to.have.been.called
          })
        })

        describe('When the comparator returns false', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: SOFT_COMPARISON, cacheFor: SOFT_CACHE_FOR, isSoftStorage, comparator: COMPARATOR, then: THEN }, data: { type: SOFT_COMPARISON, data: {} } }

            COMPARATOR.returns(false)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('does not invoke the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(0)

            expect(actions)
              .to.deep.equal([])
          })

          it('invokes the "then" function with the data action', () => {
            expect(THEN)
              .to.have.been.calledWith({ type: SOFT_COMPARISON, data: {} })
          })
        })
      })
    })

    describe('Fetch', () => {
      const isSoftStorage = true
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(`{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt - ONE_DAY}},"data":{"type":"SOFT_FETCH"}}`)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(SOFT_FETCH)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_FETCH, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(2)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage } })
        })

        it('dispatches the soft storage data action', () => {
          expect(actions.length).to.eql(2)

          expect(actions)
            .to.deep.include({ type: SOFT_FETCH })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(SOFT_FETCH)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_FETCH, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage } })
        })

        it('does not dispatch the soft storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: SOFT_FETCH })
        })
      })
    })

    describe('Store', () => {
      const isSoftStorage = true
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(`{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt - ONE_DAY}},"data":{"type":"SOFT_STORE"}}`)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(SOFT_STORE)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_STORE, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } })
        })

        it('does not dispatch the soft storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: SOFT_STORE, data: {} })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('gets the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .to.have.been.calledWith(SOFT_STORE)
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_STORE, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } })
        })

        it('does not dispatch the soft storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: SOFT_STORE, data: {} })
        })
      })
    })

    describe('Clear', () => {
      const isSoftStorage = true

      let store
      let action
      let actions

      beforeEach(() => {
        store = configureStore([ storage ])({})

        action = { type: REDUX_STORAGE_CLEAR, meta: { type: SOFT_CLEAR, isSoftStorage } }

        store.dispatch(action)

        actions = store.getActions()
      })

      it('removes the meta property type from storage', () => {
        expect(Storage.prototype.removeItem)
          .to.have.been.calledWith(SOFT_CLEAR)
      })

      it('invokes the "next" middleware with the clear action', () => {
        expect(actions.length).to.eql(1)

        expect(actions)
          .to.deep.include({ type: REDUX_STORAGE_CLEAR, meta: { type: SOFT_CLEAR, isSoftStorage } })
      })
    })
  })

  describe('State storage', () => {
    describe('Compare', () => {
      let action

      describe('With state', () => {
        describe('Always', () => {
          let store
          let action

          let NOW

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            NOW = Date.now()

            sinon.stub(Date, 'now')
              .returns(NOW)

            store = configureStore([ storage ])({ reduxStorage: { STATE_COMPARISON: { meta: { type: STATE_COMPARISON }, data: { type: STATE_COMPARISON } } } })

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: STATE_COMPARISON, cacheFor: STATE_CACHE_FOR, cachedAt: NOW - ONE_DAY, comparator: COMPARATOR, then: THEN }, data: { type: STATE_COMPARISON } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('does not get the meta property type from storage', () => {
            expect(Storage.prototype.getItem)
              .not.to.have.been.called
          })

          it('invokes the "comparator" function', () => {
            expect(COMPARATOR)
              .to.have.been.calledWith({ type: STATE_COMPARISON }, { type: STATE_COMPARISON }, { cacheFor: STATE_CACHE_FOR, cachedAt: new Date(NOW - ONE_DAY) })
          })
        })

        describe('When the comparator returns true', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({ reduxStorage: { STATE_COMPARISON: { meta: { type: STATE_COMPARISON }, data: { type: STATE_COMPARISON } } } })

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: STATE_COMPARISON, cacheFor: STATE_CACHE_FOR, comparator: COMPARATOR, then: THEN }, data: { type: STATE_COMPARISON } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('invokes the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: STATE_COMPARISON }])
          })

          it('does not invoke the "then" function with the data action', () => {
            expect(THEN)
              .not.to.have.been.called
          })
        })

        describe('When the comparator returns false', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({ reduxStorage: { STATE_COMPARISON: { meta: { type: STATE_COMPARISON }, data: { type: STATE_COMPARISON } } } })

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: STATE_COMPARISON, cacheFor: STATE_CACHE_FOR, comparator: COMPARATOR, then: THEN }, data: { type: STATE_COMPARISON } }

            COMPARATOR.returns(false)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('does not invoke the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(0)

            expect(actions)
              .to.deep.equal([])
          })

          it('invokes the "then" function with the data action', () => {
            expect(THEN)
              .to.have.been.calledWith({ type: STATE_COMPARISON })
          })
        })
      })

      describe('Without state', () => {
        beforeEach(() => {
          Storage.prototype.getItem.returns(null)
        })

        describe('Always', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: STATE_COMPARISON, cacheFor: STATE_CACHE_FOR, comparator: COMPARATOR, then: THEN }, data: { type: STATE_COMPARISON } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not get the meta property type from storage', () => {
            expect(Storage.prototype.getItem)
              .not.to.have.been.called
          })

          it('invokes the "comparator" function', () => {
            expect(COMPARATOR)
              .to.have.been.calledWith({}, { type: STATE_COMPARISON }, { cacheFor: STATE_CACHE_FOR })
          })
        })

        describe('When the comparator returns true', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: STATE_COMPARISON, cacheFor: STATE_CACHE_FOR, comparator: COMPARATOR, then: THEN }, data: { type: STATE_COMPARISON } }

            COMPARATOR.returns(true)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('invokes the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: STATE_COMPARISON }])
          })

          it('does not invoke the "then" function with the data action', () => {
            expect(THEN)
              .not.to.have.been.called
          })
        })

        describe('When the comparator returns false', () => {
          let store
          let action

          const COMPARATOR = sinon.stub()
          const THEN = sinon.stub()

          beforeEach(() => {
            store = configureStore([ storage ])({})

            action = { type: REDUX_STORAGE_COMPARISON, meta: { type: STATE_COMPARISON, cacheFor: STATE_CACHE_FOR, comparator: COMPARATOR, then: THEN }, data: { type: STATE_COMPARISON } }

            COMPARATOR.returns(false)
            THEN.returns(action)

            store.dispatch(action)
          })

          it('does not set the meta property type into storage', () => {
            expect(Storage.prototype.setItem)
              .not.to.have.been.called
          })

          it('does not invoke the "next" middleware with the data action', () => {
            const actions = store.getActions()

            expect(actions.length).to.eql(0)

            expect(actions)
              .to.deep.equal([])
          })

          it('invokes the "then" function with the data action', () => {
            expect(THEN)
              .to.have.been.calledWith({ type: STATE_COMPARISON })
          })
        })
      })
    })

    describe('Fetch', () => {
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          store = configureStore([ storage ])({ reduxStorage: { STATE_FETCH: { meta: { type: STATE_FETCH }, data: { type: STATE_FETCH } } } })

          action = { type: REDUX_STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not get the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .not.to.have.been.called
        })

        it('does not set the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(2)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt } })
        })

        it('dispatches the state storage data action', () => {
          expect(actions.length).to.eql(2)

          expect(actions)
            .to.deep.include({ type: STATE_FETCH })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not get the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .not.to.have.been.called
        })

        it('does not set the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt } })
        })

        it('does not dispatch the state storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: STATE_FETCH })
        })
      })
    })

    describe('Store', () => {
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not get the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .not.to.have.been.called
        })

        it('does not set the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } })
        })

        it('does not dispatch the state storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: STATE_STORE, data: {} })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          store = configureStore([ storage ])({})

          action = { type: REDUX_STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not get the meta property type from storage', () => {
          expect(Storage.prototype.getItem)
            .not.to.have.been.called
        })

        it('does not sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: REDUX_STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } })
        })

        it('does not dispatch the state storage data action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .not.to.deep.include({ type: STATE_STORE, data: {} })
        })
      })
    })

    describe('Clear', () => {
      let store
      let action
      let actions

      beforeEach(() => {
        store = configureStore([ storage ])({})

        action = { type: REDUX_STORAGE_CLEAR, meta: { type: STATE_CLEAR } }

        store.dispatch(action)

        actions = store.getActions()
      })

      it('does not removes the meta property type from storage', () => {
        expect(Storage.prototype.removeItem)
          .not.to.have.been.called
      })

      it('invokes the "next" middleware with the clear action', () => {
        expect(actions.length).to.eql(1)

        expect(actions)
          .to.deep.include({ type: REDUX_STORAGE_CLEAR, meta: { type: STATE_CLEAR } })
      })
    })
  })
})
