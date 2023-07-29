import { use, expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import Store from 'redux-mock-store'

import Storage from '#components/storage'

import {
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from '#actions'

import storage from '#storage'

use(sinonChai)

const {
  default: configureStore
} = Store

describe('Redux Storage Middleware - Storage', () => {
  const ONE_SECOND = 1000
  const ONE_MINUTE = ONE_SECOND * 60
  const ONE_HOUR = ONE_MINUTE * 60
  const ONE_DAY = ONE_HOUR * 24

  const HARD_CACHE_FOR = ONE_DAY // (1000 * 60 * 60 * 24)
  const SOFT_CACHE_FOR = ONE_HOUR // (1000 * 60 * 60)
  const STATE_CACHE_FOR = ONE_MINUTE // (1000 * 60)

  const HARD_FETCH = 'HARD_FETCH'
  const HARD_STORE = 'HARD_STORE'
  const HARD_CLEAR = 'HARD_CLEAR'

  const SOFT_FETCH = 'SOFT_FETCH'
  const SOFT_STORE = 'SOFT_STORE'
  const SOFT_CLEAR = 'SOFT_CLEAR'

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
    describe('Fetch', () => {
      const isHardStorage = true
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(`{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt - ONE_DAY}},"data":{"type":"HARD_FETCH"}}`)

          store = configureStore([storage])({})

          action = { type: STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_FETCH, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_FETCH, data: {} } })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([storage])({})

          action = { type: STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_FETCH, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_FETCH, meta: { type: HARD_FETCH, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_FETCH, data: {} } })
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

          store = configureStore([storage])({})

          action = { type: STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_STORE, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([storage])({})

          action = { type: STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(HARD_STORE, `{"meta":{"cacheFor":${HARD_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"HARD_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_STORE, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, cachedAt, isHardStorage }, data: { type: HARD_STORE, data: {} } })
        })
      })
    })

    describe('Clear', () => {
      const isHardStorage = true

      let store
      let action
      let actions

      beforeEach(() => {
        store = configureStore([storage])({})

        action = { type: STORAGE_CLEAR, meta: { type: HARD_CLEAR, isHardStorage } }

        store.dispatch(action)

        actions = store.getActions()
      })

      it('invokes the "next" middleware with the clear action', () => {
        expect(actions.length).to.eql(1)

        expect(actions)
          .to.deep.include({ type: STORAGE_CLEAR, meta: { type: HARD_CLEAR, isHardStorage } })
      })
    })
  })

  describe('Soft storage', () => {
    describe('Fetch', () => {
      const isSoftStorage = true
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(`{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt - ONE_DAY}},"data":{"type":"SOFT_FETCH"}}`)

          store = configureStore([storage])({})

          action = { type: STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_FETCH, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_FETCH, data: {} } })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([storage])({})

          action = { type: STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_FETCH, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_FETCH","data":{}}}`)
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_FETCH, meta: { type: SOFT_FETCH, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_FETCH, data: {} } })
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

          store = configureStore([storage])({})

          action = { type: STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_STORE, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          Storage.prototype.getItem.returns(null)

          store = configureStore([storage])({})

          action = { type: STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('sets the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .to.have.been.calledWith(SOFT_STORE, `{"meta":{"cacheFor":${SOFT_CACHE_FOR},"cachedAt":${cachedAt}},"data":{"type":"SOFT_STORE","data":{}}}`)
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_STORE, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, cachedAt, isSoftStorage }, data: { type: SOFT_STORE, data: {} } })
        })
      })
    })

    describe('Clear', () => {
      const isSoftStorage = true

      let store
      let action
      let actions

      beforeEach(() => {
        store = configureStore([storage])({})

        action = { type: STORAGE_CLEAR, meta: { type: SOFT_CLEAR, isSoftStorage } }

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
          .to.deep.include({ type: STORAGE_CLEAR, meta: { type: SOFT_CLEAR, isSoftStorage } })
      })
    })
  })

  describe('State storage', () => {
    describe('Fetch', () => {
      const cachedAt = Date.now()

      describe('With state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          store = configureStore([storage])({ reduxStorage: { STATE_FETCH: { meta: { type: STATE_FETCH }, data: { type: STATE_FETCH } } } })

          action = { type: STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not set the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_FETCH, data: {} } })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          store = configureStore([storage])({})

          action = { type: STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_FETCH, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not set the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the fetch action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_FETCH, meta: { type: STATE_FETCH, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_FETCH, data: {} } })
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
          store = configureStore([storage])({})

          action = { type: STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not set the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } })
        })
      })

      describe('Without state', () => {
        let store
        let action
        let actions

        beforeEach(() => {
          store = configureStore([storage])({})

          action = { type: STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } }

          store.dispatch(action)

          actions = store.getActions()
        })

        it('does not set the meta property type into storage', () => {
          expect(Storage.prototype.setItem)
            .not.to.have.been.called
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(1)

          expect(actions)
            .to.deep.include({ type: STORAGE_STORE, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, cachedAt }, data: { type: STATE_STORE, data: {} } })
        })
      })
    })

    describe('Clear', () => {
      let store
      let action
      let actions

      beforeEach(() => {
        store = configureStore([storage])({})

        action = { type: STORAGE_CLEAR, meta: { type: STATE_CLEAR } }

        store.dispatch(action)

        actions = store.getActions()
      })

      it('does not remove the meta property type from storage', () => {
        expect(Storage.prototype.removeItem)
          .not.to.have.been.called
      })

      it('invokes the "next" middleware with the clear action', () => {
        expect(actions.length).to.eql(1)

        expect(actions)
          .to.deep.include({ type: STORAGE_CLEAR, meta: { type: STATE_CLEAR } })
      })
    })
  })
})
