import { expect } from 'chai'
import sinon from 'sinon'

import configureStore from 'redux-mock-store'

import {
  STORAGE_COMPARE,
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import storageMap, { /*
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
  initialiseClearIsUniqueMap, */

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
  min, /*

  reduceFetch, */
  reduceStore, /*
  reduceClear, */

  dedupeFetch,
  dedupeStore,
  dedupeClear,

  filterHardStorage,
  filterSoftStorage,
  filterStorage, /*

  filterNotFetchMap,
  filterNotStoreMap,
  filterIsUniqueMap,

  putIntoFetchMap,
  putIntoStoreMap,
  putIntoClearMap,

  putIntoFetchMetaMap,
  putIntoStoreMetaMap, */

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

  const TYPE = 'TYPE'
  const META_TYPE = 'META_TYPE'

  const TIME_ONE_SECOND = 1000
  const TIME_ONE_MINUTE = TIME_ONE_SECOND * 60
  const TIME_ONE_HOUR = TIME_ONE_MINUTE * 60
  const TIME_ONE_DAY = TIME_ONE_HOUR * 24

  const DATE_NOW = Date.now()
  const DATE_WAS = (new Date('1 January 1970')).valueOf()

  const HARD_CACHE_FOR = TIME_ONE_DAY // (1000 * 60 * 60 * 24)
  const SOFT_CACHE_FOR = TIME_ONE_HOUR // (1000 * 60 * 60)
  const STATE_CACHE_FOR = TIME_ONE_MINUTE // (1000 * 60)

  const COMPARATOR = () => {}
  const ACCESSED_AT = DATE_NOW
  const CACHED_AT = TIME_ONE_SECOND
  const CACHE_FOR = TIME_ONE_SECOND

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
            expect(actions.length).to.equal(1)
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
              .to.equal(HARD_FETCH)

            expect(cacheFor)
              .to.equal(HARD_CACHE_FOR)

            expect(isHardStorage)
              .to.be.true

            expect(isSoftStorage)
              .to.be.undefined

            expect(comparator)
              .to.equal(COMPARATOR)

            expect(then)
              .to.be.a('function')
          })

          it('returns the fetch action', () => {
            expect(action).to.deep.equal({ type: HARD_FETCH })
          })
        })

        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (HARD_CACHE_FOR + TIME_ONE_SECOND)
            const isHardStorage = true

            const configuration = [
              { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [HARD_FETCH]: { meta: { cacheFor: HARD_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: HARD_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the fetch action', () => {
              expect(actions.length).to.equal(1)

              expect(actions)
                .to.deep.equal([{ type: HARD_FETCH }])
            })

            it('does not dispatch the hard storage fetch actions', () => {
              expect(actions.length).not.to.equal(2)

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
                    accessedAt: DATE_NOW,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.deep.equal({ type: HARD_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (HARD_CACHE_FOR - TIME_ONE_SECOND)
            const isHardStorage = true

            const configuration = [
              { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [HARD_FETCH]: { meta: { cacheFor: HARD_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: HARD_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the fetch action', () => {
              expect(actions.length).not.to.equal(1)

              expect(actions)
                .not.to.deep.equal([{ type: HARD_FETCH }])
            })

            it('dispatches the hard storage fetch actions', () => {
              expect(actions.length).to.equal(2)

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
                    accessedAt: DATE_NOW,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.deep.equal({ type: HARD_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          const accessedAt = DATE_NOW
          // const cachedAt = DATE_NOW - (HARD_CACHE_FOR + TIME_ONE_SECOND)
          const isHardStorage = true

          const configuration = [
            { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
          ]

          beforeEach(() => {
            sinon.stub(Date, 'now')
              .returns(DATE_NOW)

            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: HARD_FETCH })

            actions = store.getActions()
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the fetch action', () => {
            expect(actions.length).to.equal(1)

            expect(actions)
              .to.deep.equal([{ type: HARD_FETCH }])
          })

          it('does not dispatch the hard storage fetch actions', () => {
            expect(actions.length).not.to.equal(2)

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
                  accessedAt: DATE_NOW,
                  cacheFor: HARD_CACHE_FOR,
                  isHardStorage
                }
              })
          })

          it('returns the fetch action', () => {
            expect(action).to.deep.equal({ type: HARD_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        const cachedAt = DATE_NOW
        const isHardStorage = true

        const configuration = [
          { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
        ]

        beforeEach(() => {
          sinon.stub(Date, 'now')
            .returns(DATE_NOW)

          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: HARD_STORE })

          actions = store.getActions()
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: HARD_STORE })
        })

        it('dispatches the hard storage store actions', () => {
          expect(actions.length).to.equal(3)

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
          expect(action).to.deep.equal({ type: HARD_STORE })
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
          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: HARD_CLEAR })
        })

        it('dispatches the hard storage clear actions', () => {
          expect(actions.length).to.equal(3)

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
          expect(action).to.deep.equal({ type: HARD_CLEAR })
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
            expect(actions.length).to.equal(1)
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
              .to.equal(SOFT_FETCH)

            expect(cacheFor)
              .to.equal(SOFT_CACHE_FOR)

            expect(isHardStorage)
              .to.be.undefined

            expect(isSoftStorage)
              .to.be.true

            expect(comparator)
              .to.equal(COMPARATOR)

            expect(then)
              .to.be.a('function')
          })

          it('returns the fetch action', () => {
            expect(action).to.deep.equal({ type: SOFT_FETCH })
          })
        })

        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (SOFT_CACHE_FOR + TIME_ONE_SECOND)
            const isSoftStorage = true

            const configuration = [
              { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [SOFT_FETCH]: { meta: { cacheFor: SOFT_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: SOFT_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the fetch action', () => {
              expect(actions.length).to.equal(1)

              expect(actions)
                .to.deep.equal([{ type: SOFT_FETCH }])
            })

            it('does not dispatch the soft storage fetch actions', () => {
              expect(actions.length).not.to.equal(2)

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
                    accessedAt: DATE_NOW,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.deep.equal({ type: SOFT_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (SOFT_CACHE_FOR - TIME_ONE_SECOND)
            const isSoftStorage = true

            const configuration = [
              { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [SOFT_FETCH]: { meta: { cacheFor: SOFT_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: SOFT_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the fetch action', () => {
              expect(actions.length).not.to.equal(1)

              expect(actions)
                .not.to.deep.equal([{ type: SOFT_FETCH }])
            })

            it('dispatches the soft storage fetch actions', () => {
              expect(actions.length).to.equal(2)

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
                    accessedAt: DATE_NOW,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.deep.equal({ type: SOFT_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          const accessedAt = DATE_NOW
          // const cachedAt = DATE_NOW - (SOFT_CACHE_FOR + TIME_ONE_SECOND)
          const isSoftStorage = true

          const configuration = [
            { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
          ]

          beforeEach(() => {
            sinon.stub(Date, 'now')
              .returns(DATE_NOW)

            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: SOFT_FETCH })

            actions = store.getActions()
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the fetch action', () => {
            expect(actions.length).to.equal(1)

            expect(actions)
              .to.deep.equal([{ type: SOFT_FETCH }])
          })

          it('does not dispatch the soft storage fetch actions', () => {
            expect(actions.length).not.to.equal(2)

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
                  accessedAt: DATE_NOW,
                  cacheFor: SOFT_CACHE_FOR,
                  isSoftStorage
                }
              })
          })

          it('returns the fetch action', () => {
            expect(action).to.deep.equal({ type: SOFT_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        const cachedAt = DATE_NOW
        const isSoftStorage = true

        const configuration = [
          { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
        ]

        beforeEach(() => {
          sinon.stub(Date, 'now')
            .returns(DATE_NOW)

          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: SOFT_STORE })

          actions = store.getActions()
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: SOFT_STORE })
        })

        it('dispatches the soft storage store actions', () => {
          expect(actions.length).to.equal(3)

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
          expect(action).to.deep.equal({ type: SOFT_STORE })
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
          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: SOFT_CLEAR })
        })

        it('dispatches the soft storage clear actions', () => {
          expect(actions.length).to.equal(3)

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
          expect(action).to.deep.equal({ type: SOFT_CLEAR })
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
            expect(actions.length).to.equal(1)
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
              .to.equal(STATE_FETCH)

            expect(cacheFor)
              .to.equal(STATE_CACHE_FOR)

            expect(isHardStorage)
              .to.be.undefined

            expect(isSoftStorage)
              .to.be.undefined

            expect(comparator)
              .to.equal(COMPARATOR)

            expect(then)
              .to.be.a('function')
          })

          it('returns the fetch action', () => {
            expect(action).to.deep.equal({ type: STATE_FETCH })
          })
        })

        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (STATE_CACHE_FOR + TIME_ONE_SECOND)

            const configuration = [
              { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [STATE_FETCH]: { meta: { cacheFor: STATE_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: STATE_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the fetch action', () => {
              expect(actions.length).to.equal(1)

              expect(actions)
                .to.deep.equal([{ type: STATE_FETCH }])
            })

            it('does not dispatch the soft storage fetch actions', () => {
              expect(actions.length).not.to.equal(2)

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
                    accessedAt: DATE_NOW,
                    cacheFor: STATE_CACHE_FOR
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.deep.equal({ type: STATE_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (STATE_CACHE_FOR - TIME_ONE_SECOND)

            const configuration = [
              { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
            ]

            beforeEach(() => {
              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration) ])({ reduxStorage: { [STATE_FETCH]: { meta: { cacheFor: STATE_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: STATE_FETCH })

              actions = store.getActions()
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the fetch action', () => {
              expect(actions.length).not.to.equal(1)

              expect(actions)
                .not.to.deep.equal([{ type: STATE_FETCH }])
            })

            it('dispatches the soft storage fetch actions', () => {
              expect(actions.length).to.equal(2)

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
                    accessedAt: DATE_NOW,
                    cacheFor: STATE_CACHE_FOR
                  }
                })
            })

            it('returns the fetch action', () => {
              expect(action).to.deep.equal({ type: STATE_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          const accessedAt = DATE_NOW
          // const cachedAt = DATE_NOW - (STATE_CACHE_FOR + TIME_ONE_SECOND)

          const configuration = [
            { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
          ]

          beforeEach(() => {
            sinon.stub(Date, 'now')
              .returns(DATE_NOW)

            store = configureStore([ storageMap(configuration) ])({})

            action = store.dispatch({ type: STATE_FETCH })

            actions = store.getActions()
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the fetch action', () => {
            expect(actions.length).to.equal(1)

            expect(actions)
              .to.deep.equal([{ type: STATE_FETCH }])
          })

          it('does not dispatch the soft storage fetch actions', () => {
            expect(actions.length).not.to.equal(2)

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
                  accessedAt: DATE_NOW,
                  cacheFor: STATE_CACHE_FOR
                }
              })
          })

          it('returns the fetch action', () => {
            expect(action).to.deep.equal({ type: STATE_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        const cachedAt = DATE_NOW

        const configuration = [
          { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
        ]

        beforeEach(() => {
          sinon.stub(Date, 'now')
            .returns(DATE_NOW)

          store = configureStore([ storageMap(configuration) ])({})

          action = store.dispatch({ type: STATE_STORE })

          actions = store.getActions()
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the store action', () => {
          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: STATE_STORE })
        })

        it('dispatches the state storage store actions', () => {
          expect(actions.length).to.equal(3)

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
          expect(action).to.deep.equal({ type: STATE_STORE })
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
          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: STATE_CLEAR })
        })

        it('dispatches the soft storage clear actions', () => {
          expect(actions.length).to.equal(3)

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
          expect(action).to.deep.equal({ type: STATE_CLEAR })
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

      action = store.dispatch({ type: TYPE })

      actions = store.getActions()
    })

    it('invokes the "next" middleware with the action', () => {
      expect(actions.length).to.equal(1)

      expect(actions)
        .to.deep.include({ type: TYPE })
    })

    it('returns the action', () => {
      expect(action).to.deep.equal({ type: TYPE })
    })
  })

  xdescribe('initialise()', () => {

  })

  xdescribe('initialiseFetch()', () => {

  })

  xdescribe('initialiseStore()', () => {

  })

  xdescribe('initialiseClear()', () => {

  })

  xdescribe('initialiseFetchStorage()', () => {

  })

  xdescribe('initialiseFetchHardStorage()', () => {

  })

  xdescribe('initialiseFetchSoftStorage()', () => {

  })

  xdescribe('initialiseFetchMetaMap()', () => {

  })

  xdescribe('initialiseStoreStorage()', () => {

  })

  xdescribe('initialiseStoreHardStorage()', () => {

  })

  xdescribe('initialiseStoreSoftStorage()', () => {

  })

  xdescribe('initialiseStoreNotFetchMap()', () => {

  })

  xdescribe('initialiseStoreMetaMap()', () => {

  })

  xdescribe('initialiseClearIsUniqueMap()', () => {

  })

  describe('min()', () => {
    describe('With values', () => {
      describe('A range of values', () => {
        it('returns the smallest number', () => {
          expect(min([1, 10, 2, 9, 3, 8, 4, 7, 5, 6])).to.equal(1)
        })
      })

      describe('A single value', () => {
        it('returns the number', () => {
          expect(min([1])).to.equal(1)
        })
      })
    })

    describe('Without values', () => {
      it('returns `Number.POSITIVE_INFINITY`', () => {
        expect(min()).to.equal(Number.POSITIVE_INFINITY)
      })
    })
  })

  describe('max()', () => {
    describe('With values', () => {
      describe('A range of values', () => {
        it('returns the largest number', () => {
          expect(max([1, 10, 2, 9, 3, 8, 4, 7, 5, 6])).to.equal(10)
        })
      })

      describe('A single value', () => {
        it('returns the number', () => {
          expect(max([1])).to.equal(1)
        })
      })
    })

    describe('Without values', () => {
      it('returns `Number.NEGATIVE_INFINITY`', () => {
        expect(max()).to.equal(Number.NEGATIVE_INFINITY)
      })
    })
  })

  describe('isStale()', () => {
    describe('With configuration', () => {
      describe('The state is stale', () => {
        it('returns true', () => {
          const cachedAt = DATE_WAS
          const cacheFor = TIME_ONE_DAY

          expect(isStale({ cachedAt, cacheFor })).to.be.true
        })
      })

      describe('The state is not stale', () => {
        it('returns false', () => {
          const cachedAt = DATE_NOW
          const cacheFor = TIME_ONE_DAY

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

  describe('isHardStorage()', () => {
    describe('With configuration', () => {
      const cacheFor = TIME_ONE_DAY

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

  describe('isSoftStorage()', () => {
    describe('With configuration', () => {
      const cacheFor = TIME_ONE_HOUR

      describe('The state is to be cached for one hour', () => {
        it('returns true', () => {
          expect(isSoftStorage({ cacheFor })).to.be.true
        })
      })

      describe('The state is to be cached for less than one day', () => {
        it('returns true', () => {
          expect(isSoftStorage({ cacheFor: (cacheFor * 24) - 1 })).to.be.true
        })
      })

      describe('The state is to be cached for less than one hour', () => {
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

  describe('hasComparator()', () => {
    describe('With configuration', () => {
      describe('The configuration has a comparator function', () => {
        it('returns true', () => {
          expect(hasComparator({ comparator: COMPARATOR })).to.be.true
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

  describe('filterFor()', () => {
    describe('Always', () => {
      it('returns a function', () => {
        expect(filterFor()).to.be.a('function')
      })
    })

    describe('Filtering', () => {
      describe('With configuration', () => {
        describe('The argument matches the configuration "type" value', () => {
          it('returns true', () => {
            expect(filterFor(HARD_FETCH)({ type: HARD_FETCH })).to.be.true
          })
        })

        describe('The argument does not match the configuration "type" value', () => {
          it('returns false', () => {
            expect(filterFor(HARD_FETCH)({ type: SOFT_FETCH })).to.be.false
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

  describe('filterMetaFor()', () => {
    describe('Always', () => {
      it('returns a function', () => {
        expect(filterMetaFor()).to.be.a('function')
      })
    })

    describe('Filtering', () => {
      describe('With configuration', () => {
        describe('The argument matches the configuration meta "type" value', () => {
          it('returns true', () => {
            expect(filterMetaFor(HARD_FETCH)({ meta: { type: HARD_FETCH } })).to.be.true
          })
        })

        describe('The argument does not match the configuration meta "type" value', () => {
          it('returns false', () => {
            expect(filterMetaFor(HARD_FETCH)({ meta: { type: SOFT_FETCH } })).to.be.false
          })
        })
      })

      describe('Without configuration', () => {
        it('returns false', () => {
          expect(filterMetaFor(HARD_FETCH)()).to.be.false
        })
      })
    })
  })

  describe('mapType()', () => {
    describe('With configuration', () => {
      describe('The configuration has a "type" value', () => {
        it('returns the value', () => {
          expect(mapType({ type: HARD_FETCH })).to.equal(HARD_FETCH)
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

  describe('mapMetaType()', () => {
    describe('With configuration', () => {
      describe('The configuration has a meta "type" value', () => {
        it('returns the value', () => {
          expect(mapMetaType({ meta: { type: HARD_FETCH } })).to.equal(HARD_FETCH)
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

  describe('mapCacheFor()', () => {
    const cacheFor = CACHE_FOR

    describe('With configuration', () => {
      describe('The configuration has a "cacheFor" value', () => {
        it('returns the value', () => {
          expect(mapCacheFor({ meta: { cacheFor } })).to.equal(CACHE_FOR)
        })
      })

      describe('The configuration does not have a "cacheFor" value', () => {
        it('returns zero', () => {
          expect(mapCacheFor({ meta: {} })).to.equal(0)
        })
      })
    })

    describe('Without configuration', () => {
      it('returns zero', () => {
        expect(mapCacheFor()).to.equal(0)
      })
    })
  })

  describe('mapCachedAt()', () => {
    const cachedAt = CACHED_AT

    describe('With configuration', () => {
      describe('The configuration has a "cachedAt" value', () => {
        it('returns the value', () => {
          expect(mapCachedAt({ meta: { cachedAt } })).to.equal(CACHED_AT)
        })
      })

      describe('The configuration does not have a "cachedAt" value', () => {
        it('returns zero', () => {
          expect(mapCachedAt({ meta: {} })).to.equal(0)
        })
      })
    })

    describe('Without configuration', () => {
      it('returns zero', () => {
        expect(mapCachedAt()).to.equal(0)
      })
    })
  })

  describe('createIsHardStorage()', () => {
    describe('With configuration', () => {
      const cacheFor = TIME_ONE_DAY

      describe('The state is to be cached for one day', () => {
        it('returns an object', () => {
          expect(createIsHardStorage({ cacheFor }))
            .to.deep.equal({ cacheFor, isHardStorage: true })
        })
      })

      describe('The state is to be cached for more than one day', () => {
        it('returns an object', () => {
          expect(createIsHardStorage({ cacheFor: cacheFor + 1 }))
            .to.deep.equal({ cacheFor: cacheFor + 1, isHardStorage: true })
        })
      })

      describe('The state is to be cached for less than one day', () => {
        it('returns an object', () => {
          expect(createIsHardStorage({ cacheFor: cacheFor - 1 }))
            .to.deep.equal({ cacheFor: cacheFor - 1 })
        })
      })
    })

    describe('Without configuration', () => {
      it('returns an object', () => {
        expect(createIsHardStorage()).to.deep.equal({})
      })
    })
  })

  describe('createIsSoftStorage()', () => {
    describe('With configuration', () => {
      const cacheFor = TIME_ONE_HOUR

      describe('The state is to be cached for one hour', () => {
        it('returns an object', () => {
          expect(createIsSoftStorage({ cacheFor }))
            .to.deep.equal({ cacheFor, isSoftStorage: true })
        })
      })

      describe('The state is to be cached for less than one day', () => {
        it('returns an object', () => {
          expect(createIsSoftStorage({ cacheFor: (cacheFor * 24) - 1 }))
            .to.deep.equal({ cacheFor: (cacheFor * 24) - 1, isSoftStorage: true })
        })
      })

      describe('The state is to be cached for less than one hour', () => {
        it('returns an object', () => {
          expect(createIsSoftStorage({ cacheFor: cacheFor - 1 }))
            .to.deep.equal({ cacheFor: cacheFor - 1 })
        })
      })
    })

    describe('Without configuration', () => {
      it('returns an object', () => {
        expect(createIsSoftStorage())
          .to.deep.equal({})
      })
    })
  })

  describe('createComparator()', () => {
    describe('With configuration', () => {
      describe('The state has a "comparator" function', () => {
        it('returns an object', () => {
          expect(createComparator({ comparator: COMPARATOR }))
            .to.deep.equal({ comparator: COMPARATOR })
        })
      })

      describe('The state does not have a "comparator" function', () => {
        it('returns an object', () => {
          expect(createComparator({}))
            .to.deep.equal({})
        })
      })
    })

    describe('Without configuration', () => {
      it('returns an object', () => {
        expect(createComparator())
          .to.deep.equal({})
      })
    })
  })

  describe('createAccessedAt()', () => {
    describe('With configuration', () => {
      describe('The state has an "accessedAt" value', () => {
        it('returns an object', () => {
          expect(createAccessedAt({ accessedAt: DATE_NOW }))
            .to.deep.equal({ accessedAt: DATE_NOW })
        })
      })

      describe('The state does not have an "accessedAt" value', () => {
        it('returns an object', () => {
          expect(createAccessedAt({}))
            .to.deep.equal({})
        })
      })
    })

    describe('Without configuration', () => {
      it('returns an object', () => {
        expect(createAccessedAt())
          .to.deep.equal({})
      })
    })
  })

  describe('createCachedAt()', () => {
    describe('With configuration', () => {
      describe('The state has a "cachedAt" value', () => {
        it('returns an object', () => {
          expect(createCachedAt({ cachedAt: CACHED_AT }))
            .to.deep.equal({ cachedAt: CACHED_AT })
        })
      })

      describe('The state does not have a "cachedAt" value', () => {
        it('returns an object', () => {
          expect(createCachedAt({}))
            .to.deep.equal({})
        })
      })
    })

    describe('Without configuration', () => {
      it('returns an object', () => {
        expect(createCachedAt())
          .to.deep.equal({})
      })
    })
  })

  describe('createCacheFor()', () => {
    describe('With configuration', () => {
      describe('The state has a "cacheFor" value', () => {
        it('returns an object', () => {
          expect(createCacheFor({ cacheFor: CACHE_FOR }))
            .to.deep.equal({ cacheFor: CACHE_FOR })
        })
      })

      describe('The state does not have a "cacheFor" value', () => {
        it('returns an object', () => {
          expect(createCacheFor({}))
            .to.deep.equal({})
        })
      })
    })

    describe('Without configuration', () => {
      it('returns an object', () => {
        expect(createCacheFor())
          .to.deep.equal({})
      })
    })
  })

  describe('createMeta()', () => {
    describe('With configuration', () => {
      describe('The state has a "comparator" function', () => {
        it('returns an object', () => {
          expect(createMeta({ comparator: COMPARATOR }))
            .to.deep.equal({ comparator: COMPARATOR })
        })
      })

      describe('The state has an "accessedAt" value', () => {
        it('returns an object', () => {
          expect(createMeta({ accessedAt: DATE_NOW }))
            .to.deep.equal({ accessedAt: DATE_NOW })
        })
      })

      describe('The state has a "cachedAt" value', () => {
        it('returns an object', () => {
          expect(createMeta({ cachedAt: CACHED_AT }))
            .to.deep.equal({ cachedAt: CACHED_AT })
        })
      })

      describe('The state has a "cacheFor" value', () => {
        it('returns an object', () => {
          expect(createMeta({ cacheFor: CACHE_FOR }))
            .to.deep.equal({ cacheFor: CACHE_FOR })
        })
      })

      describe('The state has an "isSoftStorage" value', () => {
        it('returns an object', () => {
          expect(createMeta({ isSoftStorage: true }))
            .to.deep.equal({ isSoftStorage: true })
        })
      })

      describe('The state has an "isHardStorage" value', () => {
        it('returns an object', () => {
          expect(createMeta({ isHardStorage: true }))
            .to.deep.equal({ isHardStorage: true })
        })
      })

      describe('The state does not have a "comparator" function', () => {
        it('returns an object', () => {
          const configuration = {
            accessedAt: ACCESSED_AT,
            cachedAt: CACHED_AT,
            cacheFor: CACHE_FOR,
            isSoftStorage: true,
            isHardStorage: true
          }

          expect(createMeta(configuration))
            .to.deep.equal({
              accessedAt: ACCESSED_AT,
              cachedAt: CACHED_AT,
              cacheFor: CACHE_FOR,
              isSoftStorage: true,
              isHardStorage: true
            })
        })
      })

      describe('The state does not have an "accessedAt" value', () => {
        it('returns an object', () => {
          const configuration = {
            comparator: COMPARATOR,
            cachedAt: CACHED_AT,
            cacheFor: CACHE_FOR,
            isSoftStorage: true,
            isHardStorage: true
          }

          expect(createMeta(configuration))
            .to.deep.equal({
              comparator: COMPARATOR,
              cachedAt: CACHED_AT,
              cacheFor: CACHE_FOR,
              isSoftStorage: true,
              isHardStorage: true
            })
        })
      })

      describe('The state does not have a "cachedAt" value', () => {
        it('returns an object', () => {
          const configuration = {
            comparator: COMPARATOR,
            accessedAt: ACCESSED_AT,
            cacheFor: CACHE_FOR,
            isSoftStorage: true,
            isHardStorage: true
          }

          expect(createMeta(configuration))
            .to.deep.equal({
              comparator: COMPARATOR,
              accessedAt: ACCESSED_AT,
              cacheFor: CACHE_FOR,
              isSoftStorage: true,
              isHardStorage: true
            })
        })
      })

      describe('The state does not have a "cacheFor" value', () => {
        it('returns an object', () => {
          const configuration = {
            comparator: COMPARATOR,
            accessedAt: ACCESSED_AT,
            cachedAt: CACHED_AT,
            isSoftStorage: true,
            isHardStorage: true
          }

          expect(createMeta(configuration))
            .to.deep.equal({
              comparator: COMPARATOR,
              accessedAt: ACCESSED_AT,
              cachedAt: CACHED_AT,
              isSoftStorage: true,
              isHardStorage: true
            })
        })
      })

      describe('The state does not have an "isSoftStorage" value', () => {
        it('returns an object', () => {
          const configuration = {
            comparator: COMPARATOR,
            accessedAt: ACCESSED_AT,
            cachedAt: CACHED_AT,
            cacheFor: CACHE_FOR,
            isHardStorage: true
          }

          expect(createMeta(configuration))
            .to.deep.equal({
              comparator: COMPARATOR,
              accessedAt: ACCESSED_AT,
              cachedAt: CACHED_AT,
              cacheFor: CACHE_FOR,
              isHardStorage: true
            })
        })
      })

      describe('The state does not have an "isHardStorage" value', () => {
        it('returns an object', () => {
          const configuration = {
            comparator: COMPARATOR,
            accessedAt: ACCESSED_AT,
            cachedAt: CACHED_AT,
            cacheFor: CACHE_FOR,
            isSoftStorage: true
          }

          expect(createMeta(configuration))
            .to.deep.equal({
              comparator: COMPARATOR,
              accessedAt: ACCESSED_AT,
              cachedAt: CACHED_AT,
              cacheFor: CACHE_FOR,
              isSoftStorage: true
            })
        })
      })
    })

    describe('Without configuration', () => {
      it('returns an object', () => {
        expect(createMeta())
          .to.deep.equal({})
      })
    })
  })

  describe('hasCacheFor()', () => {
    describe('With configuration', () => {
      it('is a positive number', () => {
        expect(hasCacheFor(+1)).to.be.true
      })

      it('is not a positive number', () => {
        expect(hasCacheFor(0)).to.be.false

        expect(hasCacheFor(-1)).to.be.false
      })

      it('is a positive number as a string', () => {
        expect(hasCacheFor('+1')).to.be.true
      })

      it('is not a positive number as a string', () => {
        expect(hasCacheFor('0')).to.be.false

        expect(hasCacheFor('-1')).to.be.false
      })

      it('can coerce to a positive number', () => {
        expect(hasCacheFor(true)).to.be.true
      })

      it('cannot coerce to a positive number', () => {
        expect(hasCacheFor(false)).to.be.false

        expect(hasCacheFor(undefined)).to.be.false

        expect(hasCacheFor(null)).to.be.false
      })

      it('coerces to NaN', () => {
        expect(hasCacheFor('x')).to.be.false

        expect(hasCacheFor({})).to.be.false

        expect(hasCacheFor([])).to.be.false

        expect(hasCacheFor(NaN)).to.be.false
      })
    })

    describe('Without configuration', () => {
      it('returns false', () => {
        expect(hasCacheFor()).to.be.false
      })
    })
  })

  describe('notCacheFor()', () => {
    describe('With configuration', () => {
      it('is zero or a negative number', () => {
        expect(notCacheFor(0)).to.be.true

        expect(notCacheFor(-1)).to.be.true
      })

      it('is not zero or a negative number', () => {
        expect(notCacheFor(+1)).to.be.false
      })

      it('is zero or a negative number as a string', () => {
        expect(notCacheFor('0')).to.be.true

        expect(notCacheFor('-1')).to.be.true
      })

      it('is not zero or a negative number as a string', () => {
        expect(notCacheFor('+1')).to.be.false
      })

      it('can coerce to zero or a negative number', () => {
        expect(notCacheFor(false)).to.be.true

        expect(notCacheFor(undefined)).to.be.true

        expect(notCacheFor(null)).to.be.true
      })

      it('cannot coerce to zero or a negative number', () => {
        expect(notCacheFor(true)).to.be.false
      })

      it('coerces to NaN', () => {
        expect(notCacheFor('x')).to.be.true

        expect(notCacheFor({})).to.be.true

        expect(notCacheFor([])).to.be.true

        expect(notCacheFor(NaN)).to.be.true
      })
    })

    describe('Without configuration', () => {
      it('returns false', () => {
        expect(notCacheFor()).to.be.true
      })
    })
  })

  xdescribe('filterFetch()', () => {

  })

  xdescribe('filterStore()', () => {

  })

  xdescribe('filterClear()', () => {

  })

  xdescribe('reduceFetch()', () => {

  })

  xdescribe('reduceStore()', () => {

  })

  xdescribe('reduceClear()', () => {

  })

  describe('dedupeFetch()', () => {
    const array = []

    beforeEach(() => {
      sinon.stub(array, 'map').returns(array)
      sinon.stub(array, 'includes')
    })

    afterEach(() => {
      array.map.restore()
      array.includes.restore()
    })

    describe('With parameters', () => {
      describe('Always', () => {
        beforeEach(() => {
          dedupeFetch(array, { type: TYPE, meta: {} })
        })

        it('invokes the "map" function', () => {
          const {
            map: {
              firstCall: {
                args: [ map ]
              }
            }
          } = array

          expect(map).to.equal(mapType)
        })

        it('invokes the "includes" function with the "type" value', () => {
          const {
            includes: {
              firstCall: {
                args: [ type ]
              }
            }
          } = array

          expect(type).to.equal(TYPE)
        })
      })

      describe('The mapped array includes the "type" value', () => {
        beforeEach(() => {
          sinon.stub(array, 'concat').returns([])

          array.includes.returns(true)
        })

        afterEach(() => {
          array.concat.restore()
        })

        it('returns an array', () => {
          expect(dedupeFetch(array, { type: TYPE, meta: {} })).to.deep.equal([])
        })

        it('does not call concat', () => {
          dedupeFetch(array, { type: TYPE, meta: {} })

          expect(array.concat).not.to.have.been.called
        })
      })

      describe('The mapped array does not include the "type" value', () => {
        beforeEach(() => {
          sinon.stub(array, 'concat').returns([])

          array.includes.returns(false)
        })

        afterEach(() => {
          array.concat.restore()
        })

        it('returns an array', () => {
          expect(dedupeFetch(array, { type: TYPE, meta: {} })).to.deep.equal([])
        })

        it('calls concat with an object', () => {
          dedupeFetch(array, { type: TYPE, meta: {} })

          const {
            concat: {
              firstCall: {
                args: [ object ]
              }
            }
          } = array

          expect(object).to.deep.equal({ type: TYPE, meta: {} })
        })
      })
    })

    describe('Without parameters', () => {
      const array = []

      beforeEach(() => {
        sinon.stub(Array.prototype, 'map').returns(array)
        sinon.stub(array, 'includes')
      })

      afterEach(() => {
        Array.prototype.map.restore()
        array.includes.restore()
      })

      beforeEach(() => {
        dedupeFetch()
      })

      it('invokes the "map" function', () => {
        const {
          map: {
            firstCall: {
              args: [ map ]
            }
          }
        } = Array.prototype

        expect(map).to.equal(mapType)
      })

      it('invokes the "includes" function with the "type" value', () => {
        const {
          includes: {
            firstCall: {
              args: [ type ]
            }
          }
        } = array

        expect(type).to.be.undefined
      })
    })
  })

  describe('dedupeStore()', () => {
    const array = []

    beforeEach(() => {
      sinon.stub(array, 'map').returns(array)
      sinon.stub(array, 'includes')
    })

    afterEach(() => {
      array.map.restore()
      array.includes.restore()
    })

    describe('With parameters', () => {
      describe('Always', () => {
        beforeEach(() => {
          dedupeStore(array, { type: TYPE, meta: { type: META_TYPE } })
        })

        it('invokes the "map" function', () => {
          const {
            map: {
              firstCall: {
                args: [ map ]
              }
            }
          } = array

          expect(map).to.equal(mapMetaType)
        })

        it('invokes the "includes" function with the meta "type" value', () => {
          const {
            includes: {
              firstCall: {
                args: [ metaType ]
              }
            }
          } = array

          expect(metaType).to.equal(META_TYPE)
        })
      })

      describe('The mapped array includes the meta "type" value', () => {
        beforeEach(() => {
          sinon.stub(array, 'concat').returns([])

          array.includes.returns(true)
        })

        afterEach(() => {
          array.concat.restore()
        })

        it('returns an array', () => {
          expect(dedupeStore(array, { type: TYPE, meta: { type: META_TYPE } })).to.deep.equal([])
        })

        it('does not call concat', () => {
          dedupeStore(array, { type: TYPE, meta: { type: META_TYPE } })

          expect(array.concat).not.to.have.been.called
        })
      })

      describe('The mapped array does not include the meta "type" value', () => {
        beforeEach(() => {
          sinon.stub(array, 'concat').returns([])

          array.includes.returns(false)
        })

        afterEach(() => {
          array.concat.restore()
        })

        it('returns an array', () => {
          expect(dedupeStore(array, { type: TYPE, meta: { type: META_TYPE } })).to.deep.equal([])
        })

        it('calls concat with an object', () => {
          dedupeStore(array, { type: TYPE, meta: { type: META_TYPE } })

          const {
            concat: {
              firstCall: {
                args: [ object ]
              }
            }
          } = array

          expect(object).to.deep.equal({ type: TYPE, meta: { type: META_TYPE } })
        })
      })
    })

    describe('Without parameters', () => {
      const array = []

      beforeEach(() => {
        sinon.stub(Array.prototype, 'map').returns(array)
        sinon.stub(array, 'includes')
      })

      afterEach(() => {
        Array.prototype.map.restore()
        array.includes.restore()
      })

      beforeEach(() => {
        dedupeStore()
      })

      it('invokes the "map" function', () => {
        const {
          map: {
            firstCall: {
              args: [ map ]
            }
          }
        } = Array.prototype

        expect(map).to.equal(mapMetaType)
      })

      it('invokes the "includes" function with the meta "type" value', () => {
        const {
          includes: {
            firstCall: {
              args: [ metaType ]
            }
          }
        } = array

        expect(metaType).to.be.undefined
      })
    })
  })

  describe('dedupeClear()', () => {
    const array = []

    beforeEach(() => {
      sinon.stub(array, 'map').returns(array)
      sinon.stub(array, 'includes')
    })

    afterEach(() => {
      array.map.restore()
      array.includes.restore()
    })

    describe('With parameters', () => {
      describe('Always', () => {
        beforeEach(() => {
          dedupeClear(array, { type: TYPE, meta: { type: META_TYPE } })
        })

        it('invokes the "map" function', () => {
          const {
            map: {
              firstCall: {
                args: [ map ]
              }
            }
          } = array

          expect(map).to.equal(mapMetaType)
        })

        it('invokes the "includes" function with the meta "type" value', () => {
          const {
            includes: {
              firstCall: {
                args: [ metaType ]
              }
            }
          } = array

          expect(metaType).to.equal(META_TYPE)
        })
      })

      describe('The mapped array includes the meta "type" value', () => {
        beforeEach(() => {
          sinon.stub(array, 'concat').returns([])

          array.includes.returns(true)
        })

        afterEach(() => {
          array.concat.restore()
        })

        it('returns an array', () => {
          expect(dedupeClear(array, { type: TYPE, meta: { type: META_TYPE } })).to.deep.equal([])
        })

        it('does not call concat', () => {
          dedupeClear(array, { type: TYPE, meta: { type: META_TYPE } })

          expect(array.concat).not.to.have.been.called
        })
      })

      describe('The mapped array does not include the meta "type" value', () => {
        beforeEach(() => {
          sinon.stub(array, 'concat').returns([])

          array.includes.returns(false)
        })

        afterEach(() => {
          array.concat.restore()
        })

        it('returns an array', () => {
          expect(dedupeClear(array, { type: TYPE, meta: { type: META_TYPE } })).to.deep.equal([])
        })

        it('calls concat with an object', () => {
          dedupeClear(array, { type: TYPE, meta: { type: META_TYPE } })

          const {
            concat: {
              firstCall: {
                args: [ object ]
              }
            }
          } = array

          expect(object).to.deep.equal({ type: TYPE, meta: { type: META_TYPE } })
        })
      })
    })

    describe('Without parameters', () => {
      const array = []

      beforeEach(() => {
        sinon.stub(Array.prototype, 'map').returns(array)
        sinon.stub(array, 'includes')
      })

      afterEach(() => {
        Array.prototype.map.restore()
        array.includes.restore()
      })

      beforeEach(() => {
        dedupeClear()
      })

      it('invokes the "map" function', () => {
        const {
          map: {
            firstCall: {
              args: [ map ]
            }
          }
        } = Array.prototype

        expect(map).to.equal(mapMetaType)
      })

      it('invokes the "includes" function with the meta "type" value', () => {
        const {
          includes: {
            firstCall: {
              args: [ metaType ]
            }
          }
        } = array

        expect(metaType).to.be.undefined
      })
    })
  })

  xdescribe('filterHardStorage()', () => {

  })
  xdescribe('filterSoftStorage()', () => {

  })
  xdescribe('filterStorage()', () => {

  })

  xdescribe('filterNotFetchMap()', () => {

  })
  xdescribe('filterNotStoreMap()', () => {

  })
  xdescribe('filterIsUniqueMap()', () => {

  })

  xdescribe('putIntoFetchMap()', () => {

  })
  xdescribe('putIntoStoreMap()', () => {

  })
  xdescribe('putIntoClearMap()', () => {

  })

  xdescribe('putIntoFetchMetaMap()', () => {

  })
  xdescribe('putIntoStoreMetaMap()', () => {

  })

  describe('filterStoreHardStorageArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterStoreHardStorageArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterStoreHardStorageArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterStoreHardStorageArray(array)

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.equal(filterHardStorage)
      })
    })
  })

  describe('filterStoreSoftStorageArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterStoreSoftStorageArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterStoreSoftStorageArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterStoreSoftStorageArray(array)

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.equal(filterSoftStorage)
      })
    })
  })

  describe('filterStoreStorageArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterStoreStorageArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterStoreStorageArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterStoreStorageArray(array)

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.equal(filterStorage)
      })
    })
  })

  describe('filterFetchArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterFetchArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterFetchArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterFetchArray(array)

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.equal(filterFetch)
      })
    })
  })

  describe('filterStoreArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterStoreArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterStoreArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterStoreArray(array)

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.equal(filterStore)
      })
    })
  })

  describe('filterClearArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterClearArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterClearArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterClearArray(array)

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.equal(filterClear)
      })
    })
  })

  describe('filterNotFetchMapArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterNotFetchMapArray([], {}))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterNotFetchMapArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterNotFetchMapArray(array, {})

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.be.a('function')
      })
    })
  })

  describe('filterIsUniqueMapArray()', () => {
    describe('Always', () => {
      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterIsUniqueMapArray([], {}))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterIsUniqueMapArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterIsUniqueMapArray(array, {})

        const {
          filter: {
            firstCall: {
              args: [ filter ]
            }
          }
        } = array

        expect(filter).to.be.a('function')
      })
    })
  })

  describe('createStoreMetaArray()', () => {
    describe('Always', () => {
      describe('An array is passed as an argument', () => {
        it('returns an array', () => {
          expect(createStoreMetaArray([])).to.be.an('array')
        })
      })

      describe('An array is not passed as an argument', () => {
        it('returns an array', () => {
          expect(createStoreMetaArray()).to.be.an('array')
        })
      })
    })

    describe('An array is passed as an argument', () => {
      const one = []

      beforeEach(() => {
        sinon.stub(one, 'reduce')

        one.reduce.onCall(0).returns(one)
      })

      afterEach(() => {
        one.reduce.restore()
      })

      it('calls reduce with "reduceStore" and an array', () => {
        createStoreMetaArray(one)

        const {
          reduce: {
            firstCall: {
              args: [ ONE, TWO ]
            }
          }
        } = one

        expect(ONE).to.equal(reduceStore)
        expect(TWO).to.be.an('array')
      })

      it('calls reduce with "dedupeStore" and an array', () => {
        createStoreMetaArray(one)

        const {
          reduce: {
            secondCall: {
              args: [ ONE, TWO ]
            }
          }
        } = one

        expect(ONE).to.equal(dedupeStore)
        expect(TWO).to.be.an('array')
      })
    })
  })
})
