/* eslint-env mocha */
/* eslint no-unused-vars: 0, no-unused-expressions: 0, no-shadow: 0 */

import { expect } from 'chai'
import sinon from 'sinon'

import configureStore from 'redux-mock-store'

import {
  STORAGE_COMPARE,
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import storageMap, {
  initialise,
  initialiseFetch,
  initialiseStore,
  initialiseClear,
  initialiseFetchStorage,
  initialiseFetchHardStorage,
  initialiseFetchSoftStorage,
  initialiseFetchMetaMap,
  initialiseStoreStorage,
  initialiseStoreHardStorage,
  initialiseStoreSoftStorage,
  initialiseStoreNotFetchMap,
  initialiseStoreMetaMap,
  initialiseClearIsUniqueMap,

  isStale,
  isHardStorage,
  isSoftStorage,
  hasComparator,

  filterFor,
  filterMetaFor,

  mapType,
  mapMetaType,
  mapCacheFor,
  mapCachedAt,

  createIsHardStorage,
  createIsSoftStorage,

  createComparator,
  createAccessedAt,
  createCachedAt,
  createCacheFor,

  createMeta,

  hasCacheFor,
  notCacheFor,

  filterFetch,
  filterStore,
  filterClear,

  max,
  min,

  reduceFetch,
  reduceStore,
  reduceClear,

  dedupeFetch,
  dedupeStore,
  dedupeClear,

  filterHardStorage,
  filterSoftStorage,
  filterStorage,

  filterNotFetchMap,
  filterNotStoreMap,
  filterIsUniqueMap,

  putIntoFetchMap,
  putIntoStoreMap,
  putIntoClearMap,

  putIntoFetchMetaMap,
  putIntoStoreMetaMap,

  filterStoreHardStorageArray,
  filterStoreSoftStorageArray,
  filterStoreStorageArray,

  filterFetchArray,
  filterStoreArray,
  filterClearArray,

  filterNotFetchMapArray,
  filterIsUniqueMapArray,
  createStoreMetaArray
} from 'redux-storage-middleware/storage-map'

describe('Redux Storage Middleware - Storage Map', () => {
  const HARD_FETCH = 'HARD_FETCH'
  const HARD_STORE = 'HARD_STORE'
  const HARD_CLEAR = 'HARD_CLEAR'

  const SOFT_FETCH = 'SOFT_FETCH'
  const SOFT_STORE = 'SOFT_STORE'
  const SOFT_CLEAR = 'SOFT_CLEAR'

  const STATE_FETCH = 'STATE_FETCH'
  const STATE_STORE = 'STATE_STORE'
  const STATE_CLEAR = 'STATE_CLEAR'

  const ONE_SECOND = 1000
  const ONE_MINUTE = ONE_SECOND * 60
  const ONE_HOUR = ONE_MINUTE * 60
  const ONE_DAY = ONE_HOUR * 24

  const HARD_CACHE_FOR = ONE_DAY // (1000 * 60 * 60 * 24)
  const SOFT_CACHE_FOR = ONE_HOUR // (1000 * 60 * 60)
  const STATE_CACHE_FOR = ONE_MINUTE // (1000 * 60)

  const COMPARATOR = () => {}

  describe('Always', () => {
    it('is a function', () => {
      expect(storageMap).to.be.a('function')
    })

    it('returns the middleware', () => {
      expect(storageMap()).to.be.a('function')
    })
  })

  describe('With configuration', () => {
    describe('Hard storage', () => {
      describe('Fetch', () => {
        describe('The action is configured for comparison', () => {
          let store
          let action
          let actions

          const configuration = [
            { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR, comparator: COMPARATOR } }
          ]

          beforeEach(() => {
            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: HARD_FETCH })

            actions = store.getActions()
          })

          it('dispatches a comparison action', () => {
            expect(actions.length).to.eql(1)
          })

          it('assigns meta values to the "meta" property of the comparison action', () => {
            const [ comparisonAction ] = actions

            expect(comparisonAction)
              .to.deep.include({ type: STORAGE_COMPARE, data: { type: HARD_FETCH } })

            const {
              meta: {
                type,
                cacheFor,
                isHardStorage,
                isSoftStorage,
                comparator,
                then
              }
            } = comparisonAction

            expect(type)
              .to.eq(HARD_FETCH)

            expect(cacheFor)
              .to.eq(HARD_CACHE_FOR)

            expect(isHardStorage)
              .to.be.true

            expect(isSoftStorage)
              .to.be.undefined

            expect(comparator)
              .to.eq(COMPARATOR)

            expect(then)
              .to.be.a('function')
          })

          it('returns the fetch action', () => {
            expect(action).to.eql({ type: HARD_FETCH })
          })
        })

        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            const NOW = Date.now()

            const accessedAt = NOW
            const cachedAt = NOW - (HARD_CACHE_FOR + ONE_SECOND)
            const isHardStorage = true

            const configuration = [
              { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [HARD_FETCH]: { meta: { cacheFor: HARD_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: HARD_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the fetch action', () => {
              expect(actions.length).to.eql(1)

              expect(actions)
                .to.deep.equal([{ type: HARD_FETCH }])
            })

            it('does not dispatch the hard storage fetch actions', () => {
              expect(actions.length).not.to.eql(2)

              expect(actions)
                .not.to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: HARD_STORE,
                    accessedAt,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })

              expect(actions)
                .not.to.deep.include({
                  type: STORAGE_FETCH,
                  data: { type: HARD_FETCH },
                  meta: {
                    type: HARD_FETCH,
                    accessedAt: NOW,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.eql({ type: HARD_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            const NOW = Date.now()

            const accessedAt = NOW
            const cachedAt = NOW - (HARD_CACHE_FOR - ONE_SECOND)
            const isHardStorage = true

            const configuration = [
              { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [HARD_FETCH]: { meta: { cacheFor: HARD_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: HARD_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the fetch action', () => {
              expect(actions.length).not.to.eql(1)

              expect(actions)
                .not.to.deep.equal([{ type: HARD_FETCH }])
            })

            it('dispatches the hard storage fetch actions', () => {
              expect(actions.length).to.eql(2)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: HARD_STORE,
                    accessedAt,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  data: { type: HARD_FETCH },
                  meta: {
                    type: HARD_FETCH,
                    accessedAt: NOW,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.eql({ type: HARD_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          const NOW = Date.now()

          const accessedAt = NOW
          const cachedAt = NOW - (HARD_CACHE_FOR + ONE_SECOND)
          const isHardStorage = true

          const configuration = [
            { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
          ]

          beforeEach(() => {
            sinon.stub(Date, 'now')
              .returns(NOW)

            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: HARD_FETCH })

            actions = store.getActions()
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the fetch action', () => {
            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: HARD_FETCH }])
          })

          it('does not dispatch the hard storage fetch actions', () => {
            expect(actions.length).not.to.eql(2)

            expect(actions)
              .not.to.deep.include({
                type: STORAGE_FETCH,
                meta: {
                  type: HARD_STORE,
                  accessedAt,
                  cacheFor: HARD_CACHE_FOR,
                  isHardStorage
                }
              })

            expect(actions)
              .not.to.deep.include({
                type: STORAGE_FETCH,
                data: { type: HARD_FETCH },
                meta: {
                  type: HARD_FETCH,
                  accessedAt: NOW,
                  cacheFor: HARD_CACHE_FOR,
                  isHardStorage
                }
              })
          })

          it('returns the fetch action', () => {
            expect(action).to.eql({ type: HARD_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        const NOW = Date.now()

        const cachedAt = NOW
        const isHardStorage = true

        const configuration = [
          { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
        ]

        beforeEach(() => {
          sinon.stub(Date, 'now')
            .returns(NOW)

          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: HARD_STORE })

          actions = store.getActions()
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({ type: HARD_STORE })
        })

        it('dispatches the hard storage store actions', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({
              meta: {
                type: HARD_STORE,
                cachedAt,
                cacheFor: HARD_CACHE_FOR,
                isHardStorage
              },
              data: { type: HARD_STORE },
              type: STORAGE_STORE
            })

          expect(actions)
            .to.deep.include({
              meta: {
                type: HARD_FETCH,
                cachedAt,
                cacheFor: HARD_CACHE_FOR,
                isHardStorage
              },
              type: STORAGE_STORE
            })
        })

        it('returns the store action', () => {
          expect(action).to.eql({ type: HARD_STORE })
        })
      })

      describe('Clear', () => {
        let store
        let action
        let actions

        const isHardStorage = true

        const configuration = [
          { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } },
          { type: HARD_FETCH, meta: { type: HARD_CLEAR } }
        ]

        beforeEach(() => {
          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: HARD_CLEAR })

          actions = store.getActions()
        })

        it('invokes the "next" middleware with the clear action', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({ type: HARD_CLEAR })
        })

        it('dispatches the hard storage clear actions', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({
              meta: {
                type: HARD_STORE,
                cacheFor: HARD_CACHE_FOR,
                isHardStorage
              },
              type: STORAGE_CLEAR
            })

          expect(actions)
            .to.deep.include({
              meta: {
                type: HARD_FETCH,
                cacheFor: HARD_CACHE_FOR,
                isHardStorage
              },
              type: STORAGE_CLEAR
            })
        })

        it('returns the clear action', () => {
          expect(action).to.eql({ type: HARD_CLEAR })
        })
      })
    })

    describe('Soft storage', () => {
      describe('Fetch', () => {
        describe('The action is configured for comparison', () => {
          let store
          let action
          let actions

          const configuration = [
            { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR, comparator: COMPARATOR } }
          ]

          beforeEach(() => {
            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: SOFT_FETCH })

            actions = store.getActions()
          })

          it('dispatches a comparison action', () => {
            expect(actions.length).to.eql(1)
          })

          it('assigns meta values to the "meta" property of the comparison action', () => {
            const [ comparisonAction ] = actions

            expect(comparisonAction)
              .to.deep.include({ type: STORAGE_COMPARE, data: { type: SOFT_FETCH } })

            const {
              meta: {
                type,
                cacheFor,
                isHardStorage,
                isSoftStorage,
                comparator,
                then
              }
            } = comparisonAction

            expect(type)
              .to.eq(SOFT_FETCH)

            expect(cacheFor)
              .to.eq(SOFT_CACHE_FOR)

            expect(isHardStorage)
              .to.be.undefined

            expect(isSoftStorage)
              .to.be.true

            expect(comparator)
              .to.eq(COMPARATOR)

            expect(then)
              .to.be.a('function')
          })

          it('returns the fetch action', () => {
            expect(action).to.eql({ type: SOFT_FETCH })
          })
        })

        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            const NOW = Date.now()

            const accessedAt = NOW
            const cachedAt = NOW - (SOFT_CACHE_FOR + ONE_SECOND)
            const isSoftStorage = true

            const configuration = [
              { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [SOFT_FETCH]: { meta: { cacheFor: SOFT_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: SOFT_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the fetch action', () => {
              expect(actions.length).to.eql(1)

              expect(actions)
                .to.deep.equal([{ type: SOFT_FETCH }])
            })

            it('does not dispatch the soft storage fetch actions', () => {
              expect(actions.length).not.to.eql(2)

              expect(actions)
                .not.to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: SOFT_STORE,
                    accessedAt,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })

              expect(actions)
                .not.to.deep.include({
                  type: STORAGE_FETCH,
                  data: { type: SOFT_FETCH },
                  meta: {
                    type: SOFT_FETCH,
                    accessedAt: NOW,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.eql({ type: SOFT_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            const NOW = Date.now()

            const accessedAt = NOW
            const cachedAt = NOW - (SOFT_CACHE_FOR - ONE_SECOND)
            const isSoftStorage = true

            const configuration = [
              { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [SOFT_FETCH]: { meta: { cacheFor: SOFT_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: SOFT_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the fetch action', () => {
              expect(actions.length).not.to.eql(1)

              expect(actions)
                .not.to.deep.equal([{ type: SOFT_FETCH }])
            })

            it('dispatches the soft storage fetch actions', () => {
              expect(actions.length).to.eql(2)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: SOFT_STORE,
                    accessedAt,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  data: { type: SOFT_FETCH },
                  meta: {
                    type: SOFT_FETCH,
                    accessedAt: NOW,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.eql({ type: SOFT_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          const NOW = Date.now()

          const accessedAt = NOW
          const cachedAt = NOW - (SOFT_CACHE_FOR + ONE_SECOND)
          const isSoftStorage = true

          const configuration = [
            { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
          ]

          beforeEach(() => {
            sinon.stub(Date, 'now')
              .returns(NOW)

            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: SOFT_FETCH })

            actions = store.getActions()
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the fetch action', () => {
            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: SOFT_FETCH }])
          })

          it('does not dispatch the soft storage fetch actions', () => {
            expect(actions.length).not.to.eql(2)

            expect(actions)
              .not.to.deep.include({
                type: STORAGE_FETCH,
                meta: {
                  type: SOFT_STORE,
                  accessedAt,
                  cacheFor: SOFT_CACHE_FOR,
                  isSoftStorage
                }
              })

            expect(actions)
              .not.to.deep.include({
                type: STORAGE_FETCH,
                data: { type: SOFT_FETCH },
                meta: {
                  type: SOFT_FETCH,
                  accessedAt: NOW,
                  cacheFor: SOFT_CACHE_FOR,
                  isSoftStorage
                }
              })
          })

          it('returns the fetch action', () => {
            expect(action).to.eql({ type: SOFT_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        const NOW = Date.now()

        const cachedAt = NOW
        const isSoftStorage = true

        const configuration = [
          { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
        ]

        beforeEach(() => {
          sinon.stub(Date, 'now')
            .returns(NOW)

          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: SOFT_STORE })

          actions = store.getActions()
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({ type: SOFT_STORE })
        })

        it('dispatches the soft storage store actions', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({
              meta: {
                type: SOFT_STORE,
                cachedAt,
                cacheFor: SOFT_CACHE_FOR,
                isSoftStorage
              },
              data: { type: SOFT_STORE },
              type: STORAGE_STORE
            })

          expect(actions)
            .to.deep.include({
              meta: {
                type: SOFT_FETCH,
                cachedAt,
                cacheFor: SOFT_CACHE_FOR,
                isSoftStorage
              },
              type: STORAGE_STORE
            })
        })

        it('returns the store action', () => {
          expect(action).to.eql({ type: SOFT_STORE })
        })
      })

      describe('Clear', () => {
        let store
        let action
        let actions

        const isSoftStorage = true

        const configuration = [
          { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } },
          { type: SOFT_FETCH, meta: { type: SOFT_CLEAR } }
        ]

        beforeEach(() => {
          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: SOFT_CLEAR })

          actions = store.getActions()
        })

        it('invokes the "next" middleware with the clear action', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({ type: SOFT_CLEAR })
        })

        it('dispatches the soft storage clear actions', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({
              meta: {
                type: SOFT_STORE,
                cacheFor: SOFT_CACHE_FOR,
                isSoftStorage
              },
              type: STORAGE_CLEAR
            })

          expect(actions)
            .to.deep.include({
              meta: {
                type: SOFT_FETCH,
                cacheFor: SOFT_CACHE_FOR,
                isSoftStorage
              },
              type: STORAGE_CLEAR
            })
        })

        it('returns the clear action', () => {
          expect(action).to.eql({ type: SOFT_CLEAR })
        })
      })
    })

    describe('State storage', () => {
      describe('Fetch', () => {
        describe('The action is configured for comparison', () => {
          let store
          let action
          let actions

          const configuration = [
            { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR, comparator: COMPARATOR } }
          ]

          beforeEach(() => {
            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: STATE_FETCH })

            actions = store.getActions()
          })

          it('dispatches a comparison action', () => {
            expect(actions.length).to.eql(1)
          })

          it('assigns meta values to the "meta" property of the comparison action', () => {
            const [ comparisonAction ] = actions

            expect(comparisonAction)
              .to.deep.include({ type: STORAGE_COMPARE, data: { type: STATE_FETCH } })

            const {
              meta: {
                type,
                cacheFor,
                isHardStorage,
                isSoftStorage,
                comparator,
                then
              }
            } = comparisonAction

            expect(type)
              .to.eq(STATE_FETCH)

            expect(cacheFor)
              .to.eq(STATE_CACHE_FOR)

            expect(isHardStorage)
              .to.be.undefined

            expect(isSoftStorage)
              .to.be.undefined

            expect(comparator)
              .to.eq(COMPARATOR)

            expect(then)
              .to.be.a('function')
          })

          it('returns the fetch action', () => {
            expect(action).to.eql({ type: STATE_FETCH })
          })
        })

        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            const NOW = Date.now()

            const accessedAt = NOW
            const cachedAt = NOW - (STATE_CACHE_FOR + ONE_SECOND)

            const configuration = [
              { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [STATE_FETCH]: { meta: { cacheFor: STATE_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: STATE_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the fetch action', () => {
              expect(actions.length).to.eql(1)

              expect(actions)
                .to.deep.equal([{ type: STATE_FETCH }])
            })

            it('does not dispatch the soft storage fetch actions', () => {
              expect(actions.length).not.to.eql(2)

              expect(actions)
                .not.to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: STATE_STORE,
                    accessedAt,
                    cacheFor: STATE_CACHE_FOR
                  }
                })

              expect(actions)
                .not.to.deep.include({
                  type: STORAGE_FETCH,
                  data: { type: STATE_FETCH },
                  meta: {
                    type: STATE_FETCH,
                    accessedAt: NOW,
                    cacheFor: STATE_CACHE_FOR
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.eql({ type: STATE_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            const NOW = Date.now()

            const accessedAt = NOW
            const cachedAt = NOW - (STATE_CACHE_FOR - ONE_SECOND)

            const configuration = [
              { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [STATE_FETCH]: { meta: { cacheFor: STATE_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: STATE_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the fetch action', () => {
              expect(actions.length).not.to.eql(1)

              expect(actions)
                .not.to.deep.equal([{ type: STATE_FETCH }])
            })

            it('dispatches the soft storage fetch actions', () => {
              expect(actions.length).to.eql(2)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: STATE_STORE,
                    accessedAt,
                    cacheFor: STATE_CACHE_FOR
                  }
                })

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  data: { type: STATE_FETCH },
                  meta: {
                    type: STATE_FETCH,
                    accessedAt: NOW,
                    cacheFor: STATE_CACHE_FOR
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.eql({ type: STATE_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          const NOW = Date.now()

          const accessedAt = NOW
          const cachedAt = NOW - (STATE_CACHE_FOR + ONE_SECOND)

          const configuration = [
            { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
          ]

          beforeEach(() => {
            sinon.stub(Date, 'now')
              .returns(NOW)

            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: STATE_FETCH })

            actions = store.getActions()
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the fetch action', () => {
            expect(actions.length).to.eql(1)

            expect(actions)
              .to.deep.equal([{ type: STATE_FETCH }])
          })

          it('does not dispatch the soft storage fetch actions', () => {
            expect(actions.length).not.to.eql(2)

            expect(actions)
              .not.to.deep.include({
                type: STORAGE_FETCH,
                meta: {
                  type: STATE_STORE,
                  accessedAt,
                  cacheFor: STATE_CACHE_FOR
                }
              })

            expect(actions)
              .not.to.deep.include({
                type: STORAGE_FETCH,
                data: { type: STATE_FETCH },
                meta: {
                  type: STATE_FETCH,
                  accessedAt: NOW,
                  cacheFor: STATE_CACHE_FOR
                }
              })
          })

          it('returns the fetch action', () => {
            expect(action).to.eql({ type: STATE_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        const NOW = Date.now()

        const cachedAt = NOW

        const configuration = [
          { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
        ]

        beforeEach(() => {
          sinon.stub(Date, 'now')
            .returns(NOW)

          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: STATE_STORE })

          actions = store.getActions()
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({ type: STATE_STORE })
        })

        it('dispatches the state storage store actions', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({
              meta: {
                type: STATE_STORE,
                cachedAt,
                cacheFor: STATE_CACHE_FOR
              },
              data: { type: STATE_STORE },
              type: STORAGE_STORE
            })

          expect(actions)
            .to.deep.include({
              meta: {
                type: STATE_FETCH,
                cachedAt,
                cacheFor: STATE_CACHE_FOR
              },
              type: STORAGE_STORE
            })
        })

        it('returns the store action', () => {
          expect(action).to.eql({ type: STATE_STORE })
        })
      })

      describe('Clear', () => {
        let store
        let action
        let actions

        const configuration = [
          { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } },
          { type: STATE_FETCH, meta: { type: STATE_CLEAR } }
        ]

        beforeEach(() => {
          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: STATE_CLEAR })

          actions = store.getActions()
        })

        it('invokes the "next" middleware with the clear action', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({ type: STATE_CLEAR })
        })

        it('dispatches the soft storage clear actions', () => {
          expect(actions.length).to.eql(3)

          expect(actions)
            .to.deep.include({
              meta: {
                type: STATE_STORE,
                cacheFor: STATE_CACHE_FOR
              },
              type: STORAGE_CLEAR
            })

          expect(actions)
            .to.deep.include({
              meta: {
                type: STATE_FETCH,
                cacheFor: STATE_CACHE_FOR
              },
              type: STORAGE_CLEAR
            })
        })

        it('returns the clear action', () => {
          expect(action).to.eql({ type: STATE_CLEAR })
        })
      })
    })
  })

  describe('Without configuration', () => {
    let store
    let action
    let actions

    beforeEach(() => {
      store = configureStore([ storageMap() ])({})

      action = store.dispatch({ type: 'ACTION' })

      actions = store.getActions()
    })

    it('invokes the "next" middleware with the action', () => {
      expect(actions.length).to.eql(1)

      expect(actions)
        .to.deep.include({ type: 'ACTION' })
    })

    it('returns the action', () => {
      expect(action).to.eql({ type: 'ACTION' })
    })
  })

  xdescribe('`initialise()`', () => {

  })

  xdescribe('`initialiseFetch()`', () => {

  })

  xdescribe('`initialiseStore()`', () => {

  })

  xdescribe('`initialiseClear()`', () => {

  })

  xdescribe('`initialiseFetchStorage()`', () => {

  })

  xdescribe('`initialiseFetchHardStorage()`', () => {

  })

  xdescribe('`initialiseFetchSoftStorage()`', () => {

  })

  xdescribe('`initialiseFetchMetaMap()`', () => {

  })

  xdescribe('`initialiseStoreStorage()`', () => {

  })

  xdescribe('`initialiseStoreHardStorage()`', () => {

  })

  xdescribe('`initialiseStoreSoftStorage()`', () => {

  })

  xdescribe('`initialiseStoreNotFetchMap()`', () => {

  })

  xdescribe('`initialiseStoreMetaMap()`', () => {

  })

  xdescribe('`initialiseClearIsUniqueMap()`', () => {

  })

  describe('`min()`', () => {
    describe('With values', () => {
      describe('A range of values', () => {
        it('returns the smallest number', () => {
          expect(min([1, 10, 2, 9, 3, 8, 4, 7, 5, 6])).to.eq(1)
        })
      })

      describe('A single value', () => {
        it('returns the number', () => {
          expect(min([1])).to.eq(1)
        })
      })
    })

    describe('Without values', () => {
      it('returns `Number.POSITIVE_INFINITY`', () => {
        expect(min()).to.eq(Number.POSITIVE_INFINITY)
      })
    })
  })

  describe('`max()`', () => {
    describe('With values', () => {
      describe('A range of values', () => {
        it('returns the largest number', () => {
          expect(max([1, 10, 2, 9, 3, 8, 4, 7, 5, 6])).to.eq(10)
        })
      })

      describe('A single value', () => {
        it('returns the number', () => {
          expect(max([1])).to.eq(1)
        })
      })
    })

    describe('Without values', () => {
      it('returns `Number.NEGATIVE_INFINITY`', () => {
        expect(max()).to.eq(Number.NEGATIVE_INFINITY)
      })
    })
  })

  describe('`isStale()`', () => {
    describe('With configuration', () => {
      describe('The state is stale', () => {
        it('returns true', () => {
          const cachedAt = (new Date('1 January 1970')).valueOf()
          const cacheFor = 1000 * 60 * 60 * 24

          expect(isStale({ cachedAt, cacheFor })).to.be.true
        })
      })

      describe('The state is not stale', () => {
        it('returns false', () => {
          const cachedAt = Date.now()
          const cacheFor = 1000 * 60 * 60 * 24

          expect(isStale({ cachedAt, cacheFor })).to.be.false
        })
      })
    })

    describe('Without configuration', () => {
      it('returns true', () => {
        expect(isStale()).to.be.true
      })
    })
  })

  describe('`isHardStorage()`', () => {
    describe('With configuration', () => {
      const cacheFor = 1000 * 60 * 60 * 24

      describe('The state is to be cached for one day', () => {
        it('returns true', () => {
          expect(isHardStorage({ cacheFor })).to.be.true
        })
      })

      describe('The state is to be cached for more than one day', () => {
        it('returns true', () => {
          expect(isHardStorage({ cacheFor: cacheFor + 1 })).to.be.true
        })
      })

      describe('The state is to be cached for less than one day', () => {
        it('returns false', () => {
          expect(isHardStorage({ cacheFor: cacheFor - 1 })).to.be.false
        })
      })
    })

    describe('Without configuration', () => {
      it('returns false', () => {
        expect(isHardStorage()).to.be.false
      })
    })
  })

  describe('`isSoftStorage()`', () => {
    describe('With configuration', () => {
      const cacheFor = 1000 * 60 * 60

      describe('The state is to be cached for more than an hour', () => {
        it('returns true', () => {
          expect(isSoftStorage({ cacheFor })).to.be.true
        })
      })

      describe('The state is to be cached for less than one day', () => {
        it('returns true', () => {
          expect(isSoftStorage({ cacheFor: (cacheFor * 24) - 1 })).to.be.true
        })
      })

      describe('The state is to be cached for less than an hour', () => {
        it('returns false', () => {
          expect(isSoftStorage({ cacheFor: cacheFor - 1 })).to.be.false
        })
      })
    })

    describe('Without configuration', () => {
      it('returns false', () => {
        expect(isSoftStorage()).to.be.false
      })
    })
  })

  describe('`hasComparator()`', () => {
    describe('With configuration', () => {
      describe('The configuration has a comparator function', () => {
        it('returns true', () => {
          expect(hasComparator({ comparator: () => {} })).to.be.true
        })
      })

      describe('The configuration does not have a comparator function', () => {
        it('returns false', () => {
          expect(hasComparator({})).to.be.false
        })
      })
    })

    describe('Without configuration', () => {
      it('returns false', () => {
        expect(hasComparator()).to.be.false
      })
    })
  })

  describe('`filterFor()`', () => {
    describe('Always', () => {
      it('returns a function', () => {
        expect(filterFor()).to.be.a('function')
      })
    })

    describe('Filtering', () => {
      describe('With configuration', () => {
        describe('The argument matches the configuration "type" value', () => {
          it('returns true', () => {
            expect(filterFor('mock type a')({ type: 'mock type a' })).to.be.true
          })
        })

        describe('The argument does not match the configuration "type" value', () => {
          it('returns false', () => {
            expect(filterFor('mock type a')({ type: 'mock type b' })).to.be.false
          })
        })
      })

      describe('Without configuration', () => {
        it('returns false', () => {
          expect(filterFor('mock type')()).to.be.false
        })
      })
    })
  })

  describe('`filterMetaFor()`', () => {
    describe('Always', () => {
      it('returns a function', () => {
        expect(filterMetaFor()).to.be.a('function')
      })
    })

    describe('Filtering', () => {
      describe('With configuration', () => {
        describe('The argument matches the configuration meta "type" value', () => {
          it('returns true', () => {
            expect(filterMetaFor('mock type a')({ meta: { type: 'mock type a' } })).to.be.true
          })
        })

        describe('The argument does not match the configuration meta "type" value', () => {
          it('returns false', () => {
            expect(filterMetaFor('mock type a')({ meta: { type: 'mock type b' } })).to.be.false
          })
        })
      })

      describe('Without configuration', () => {
        it('returns false', () => {
          expect(filterMetaFor('mock type')()).to.be.false
        })
      })
    })
  })

  describe('`mapType()`', () => {
    describe('With configuration', () => {
      describe('The configuration has a "type" value', () => {
        it('returns the value', () => {
          expect(mapType({ type: 'mock type' })).to.eq('mock type')
        })
      })

      describe('The configuration does not have a "type" value', () => {
        it('returns null', () => {
          expect(mapType({})).to.be.null
        })
      })
    })

    describe('Without configuration', () => {
      it('returns null', () => {
        expect(mapType()).to.be.null
      })
    })
  })

  describe('`mapMetaType()`', () => {
    describe('With configuration', () => {
      describe('The configuration has a meta "type" value', () => {
        it('returns the value', () => {
          expect(mapMetaType({ meta: { type: 'mock meta type' } })).to.eq('mock meta type')
        })
      })

      describe('The configuration does not have a meta "type" value', () => {
        it('returns null', () => {
          expect(mapMetaType({ meta: {} })).to.be.null
        })
      })
    })

    describe('Without configuration', () => {
      it('returns null', () => {
        expect(mapMetaType()).to.be.null
      })
    })
  })

  describe('`mapCacheFor()`', () => {
    describe('With configuration', () => {
      describe('The configuration has a "cacheFor" value', () => {
        it('returns the value', () => {
          expect(mapCacheFor({ meta: { cacheFor: 1 } })).to.eq(1)
        })
      })

      describe('The configuration does not have a "cacheFor" value', () => {
        it('returns zero', () => {
          expect(mapCacheFor({ meta: {} })).to.eq(0)
        })
      })
    })

    describe('Without configuration', () => {
      it('returns zero', () => {
        expect(mapCacheFor()).to.eq(0)
      })
    })
  })

  describe('`mapCachedAt()`', () => {
    describe('With configuration', () => {
      describe('The configuration has a "cachedAt" value', () => {
        it('returns the value', () => {
          expect(mapCachedAt({ meta: { cachedAt: 1 } })).to.eq(1)
        })
      })

      describe('The configuration does not have a "cachedAt" value', () => {
        it('returns zero', () => {
          expect(mapCachedAt({ meta: {} })).to.eq(0)
        })
      })
    })

    describe('Without configuration', () => {
      it('returns zero', () => {
        expect(mapCachedAt()).to.eq(0)
      })
    })
  })

  xdescribe('`createIsHardStorage()`', () => {

  })
  xdescribe('`createIsSoftStorage()`', () => {

  })

  xdescribe('`createComparator()`', () => {

  })
  xdescribe('`createAccessedAt()`', () => {

  })
  xdescribe('`createCachedAt()`', () => {

  })
  xdescribe('`createCacheFor()`', () => {

  })

  xdescribe('`createMeta()`', () => {

  })

  xdescribe('`hasCacheFor()`', () => {

  })
  xdescribe('`notCacheFor()`', () => {

  })

  xdescribe('`filterFetch()`', () => {

  })
  xdescribe('`filterStore()`', () => {

  })
  xdescribe('`filterClear()`', () => {

  })

  xdescribe('`reduceFetch()`', () => {

  })
  xdescribe('`reduceStore()`', () => {

  })
  xdescribe('`reduceClear()`', () => {

  })

  xdescribe('`dedupeFetch()`', () => {

  })
  xdescribe('`dedupeStore()`', () => {

  })
  xdescribe('`dedupeClear()`', () => {

  })

  xdescribe('`filterHardStorage()`', () => {

  })
  xdescribe('`filterSoftStorage()`', () => {

  })
  xdescribe('`filterStorage()`', () => {

  })

  xdescribe('`filterNotFetchMap()`', () => {

  })
  xdescribe('`filterNotStoreMap()`', () => {

  })
  xdescribe('`filterIsUniqueMap()`', () => {

  })

  xdescribe('`putIntoFetchMap()`', () => {

  })
  xdescribe('`putIntoStoreMap()`', () => {

  })
  xdescribe('`putIntoClearMap()`', () => {

  })

  xdescribe('`putIntoFetchMetaMap()`', () => {

  })
  xdescribe('`putIntoStoreMetaMap()`', () => {

  })

  xdescribe('`filterStoreHardStorageArray()`', () => {

  })
  xdescribe('`filterStoreSoftStorageArray()`', () => {

  })
  xdescribe('`filterStoreStorageArray()`', () => {

  })

  xdescribe('`filterFetchArray()`', () => {

  })
  xdescribe('`filterStoreArray()`', () => {

  })
  xdescribe('`filterClearArray()`', () => {

  })

  xdescribe('`filterNotFetchMapArray()`', () => {

  })
  xdescribe('`filterIsUniqueMapArray()`', () => {

  })
  xdescribe('`createStoreMetaArray()`', () => {

  })
})
