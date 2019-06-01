import { expect } from 'chai'
import sinon from 'sinon'

import configureStore from 'redux-mock-store'

import {
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

  // reduceFetch,
  // reduceStore,
  // reduceClear,

  reduceMetaFetch,
  reduceMetaStore,

  dedupeMetaFetch,
  dedupeMetaStore,

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

  filterHardStorageArray,
  filterSoftStorageArray,
  filterStorageArray,

  filterFetchArray,
  filterStoreArray,
  filterClearArray,

  filterNotFetchMapArray,
  filterIsUniqueMapArray,

  createFetchMetaArray,
  createStoreMetaArray
} from 'redux-storage-middleware/storage-map'

function log (configuration = [], {
  fetchMap = new Map(),
  storeMap = new Map(),
  fetchMetaMap = new Map(),
  storeMetaMap = new Map(),
  clearMap = new Map()
} = {}) {
  console.group('Configuration')
  console.table(configuration)
  console.groupEnd()

  console.group('Maps')
  console.group('fetchMap (Map)')
  Array.from(fetchMap.keys())
    .forEach((key) => {
      console.group(key)
      console.table(fetchMap.get(key))
      console.groupEnd()
    })
  console.groupEnd()

  console.group('fetchMetaMap (Map of Sets)')
  Array.from(fetchMetaMap.keys())
    .forEach((key) => {
      console.group(key)
      fetchMetaMap.get(key)
        .forEach((value) => console.table(value)) // fetchMetaMap.get(key), value))
      console.groupEnd()
    })
  console.groupEnd()

  console.group('storeMap (Map of Sets)')
  Array.from(storeMap.keys())
    .forEach((key) => {
      console.group(key)
      storeMap.get(key)
        .forEach((value) => console.table(value)) // storeMap.get(key), value))
      console.groupEnd()
    })
  console.groupEnd()

  console.group('storeMetaMap (Map)')
  Array.from(storeMetaMap.keys())
    .forEach((key) => {
      console.group(key)
      console.table(storeMetaMap.get(key))
      console.groupEnd()
    })
  console.groupEnd()
  console.groupEnd()
}

describe('Redux Storage Middleware - Storage Map', () => {
  const HARD_FETCH = 'HARD_FETCH'
  const HARD_STORE = 'HARD_STORE'

  const SOFT_FETCH = 'SOFT_FETCH'
  const SOFT_STORE = 'SOFT_STORE'

  const STATE_FETCH = 'STATE_FETCH'
  const STATE_STORE = 'STATE_STORE'

  const TYPE = 'TYPE'
  const META_TYPE = 'META_TYPE'

  const TIME_ONE_SECOND = 1000
  const TIME_ONE_MINUTE = TIME_ONE_SECOND * 60
  const TIME_ONE_HOUR = TIME_ONE_MINUTE * 60
  const TIME_ONE_DAY = TIME_ONE_HOUR * 24

  const DATE_NOW = Date.now()
  const DATE_WAS = (new Date('1 January 1970')).valueOf()

  const COMPARATOR = function () { }

  const HARD_CACHE_FOR = TIME_ONE_DAY // (1000 * 60 * 60 * 24)
  const SOFT_CACHE_FOR = TIME_ONE_HOUR // (1000 * 60 * 60)
  const STATE_CACHE_FOR = TIME_ONE_MINUTE // (1000 * 60)

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
        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            let configuration
            let maps

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (HARD_CACHE_FOR + TIME_ONE_SECOND)
            const isHardStorage = true

            beforeEach(() => {
              configuration = [
                { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
              ]

              maps = {
                fetchMap: new Map(),
                storeMap: new Map(),
                fetchMetaMap: new Map(),
                storeMetaMap: new Map(),
                clearMap: new Map()
              }

              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration, maps) ])({ reduxStorage: { [HARD_FETCH]: { meta: { cacheFor: HARD_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: HARD_FETCH })

              actions = store.getActions()

              log(configuration, maps)
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(2)

              expect(actions)
                .to.deep.include({ type: HARD_FETCH })
            })

            it('dispatches the `STORAGE_CLEAR` action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(2)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_CLEAR,
                  meta: {
                    type: HARD_FETCH,
                    accessedAt,
                    cachedAt,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })
            })

            it('returns the action', () => {
              expect(action).to.deep.equal({ type: HARD_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            let configuration
            let maps

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (HARD_CACHE_FOR - TIME_ONE_SECOND)
            const isHardStorage = true

            beforeEach(() => {
              configuration = [
                { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
              ]

              maps = {
                fetchMap: new Map(),
                storeMap: new Map(),
                fetchMetaMap: new Map(),
                storeMetaMap: new Map(),
                clearMap: new Map()
              }

              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration, maps) ])({ reduxStorage: { [HARD_FETCH]: { meta: { cacheFor: HARD_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: HARD_FETCH })

              actions = store.getActions()

              log(configuration, maps)
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(1)

              expect(actions)
                .not.to.deep.include({ type: HARD_FETCH })
            })

            it('dispatches the `STORAGE_FETCH` actions', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(1)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: HARD_FETCH,
                    accessedAt,
                    cachedAt,
                    cacheFor: HARD_CACHE_FOR,
                    isHardStorage
                  }
                })
            })

            it('returns the action', () => {
              expect(action).to.deep.equal({ type: HARD_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          let configuration
          let maps

          const accessedAt = DATE_NOW
          const isHardStorage = true

          beforeEach(() => {
            configuration = [
              { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
            ]

            maps = {
              fetchMap: new Map(),
              storeMap: new Map(),
              fetchMetaMap: new Map(),
              storeMetaMap: new Map(),
              clearMap: new Map()
            }

            sinon.stub(Date, 'now')
              .returns(DATE_NOW)

            store = configureStore([ storageMap(configuration, maps) ])({})

            action = store.dispatch({ type: HARD_FETCH })

            actions = store.getActions()

            log(configuration, maps)
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the action', () => {
            actions.forEach((action) => console.table(action))

            expect(actions.length).to.equal(2)

            expect(actions)
              .to.deep.include({ type: HARD_FETCH })
          })

          it('dispatches the `STORAGE_CLEAR` action', () => {
            actions.forEach((action) => console.table(action))

            expect(actions.length).to.equal(2)

            expect(actions)
              .to.deep.include({
                type: STORAGE_CLEAR,
                meta: {
                  type: HARD_FETCH,
                  accessedAt,
                  cacheFor: HARD_CACHE_FOR,
                  isHardStorage
                }
              })
          })

          it('returns the action', () => {
            expect(action).to.deep.equal({ type: HARD_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        let configuration
        let maps

        const accessedAt = DATE_NOW
        const cachedAt = DATE_NOW
        const isHardStorage = true

        beforeEach(() => {
          configuration = [
            { type: HARD_FETCH, meta: { type: HARD_STORE, cacheFor: HARD_CACHE_FOR } }
          ]

          maps = {
            fetchMap: new Map(),
            storeMap: new Map(),
            fetchMetaMap: new Map(),
            storeMetaMap: new Map(),
            clearMap: new Map()
          }

          sinon.stub(Date, 'now')
            .returns(DATE_NOW)

          store = configureStore([ storageMap(configuration, maps) ])({})

          action = store.dispatch({ type: HARD_STORE })

          actions = store.getActions()

          log(configuration, maps)
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the action', () => {
          actions.forEach((action) => console.table(action))

          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: HARD_STORE })
        })

        it('dispatches the `STORAGE_STORE` actions', () => {
          actions.forEach((action) => console.table(action))

          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({
              type: STORAGE_STORE,
              meta: {
                type: HARD_STORE,
                accessedAt,
                cachedAt,
                cacheFor: HARD_CACHE_FOR,
                isHardStorage
              },
              data: { type: HARD_STORE }
            })

          expect(actions)
            .to.deep.include({
              type: STORAGE_STORE,
              meta: {
                type: HARD_FETCH,
                accessedAt,
                cachedAt,
                cacheFor: HARD_CACHE_FOR,
                isHardStorage
              }
            })
        })

        it('returns the action', () => {
          expect(action).to.deep.equal({ type: HARD_STORE })
        })
      })
    })

    describe('Soft storage', () => {
      describe('Fetch', () => {
        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            let configuration
            let maps

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (SOFT_CACHE_FOR + TIME_ONE_SECOND)
            const isSoftStorage = true

            beforeEach(() => {
              configuration = [
                { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
              ]

              maps = {
                fetchMap: new Map(),
                storeMap: new Map(),
                fetchMetaMap: new Map(),
                storeMetaMap: new Map(),
                clearMap: new Map()
              }

              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration, maps) ])({ reduxStorage: { [SOFT_FETCH]: { meta: { cacheFor: SOFT_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: SOFT_FETCH })

              actions = store.getActions()

              log(configuration, maps)
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(2)

              expect(actions)
                .to.deep.include({ type: SOFT_FETCH })
            })

            it('dispatches the `STORAGE_CLEAR` action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(2)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_CLEAR,
                  meta: {
                    type: SOFT_FETCH,
                    accessedAt,
                    cachedAt,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })
            })

            it('returns the action', () => {
              expect(action).to.deep.equal({ type: SOFT_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            let configuration
            let maps

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (SOFT_CACHE_FOR - TIME_ONE_SECOND)
            const isSoftStorage = true

            beforeEach(() => {
              configuration = [
                { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
              ]

              maps = {
                fetchMap: new Map(),
                storeMap: new Map(),
                fetchMetaMap: new Map(),
                storeMetaMap: new Map(),
                clearMap: new Map()
              }

              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration, maps) ])({ reduxStorage: { [SOFT_FETCH]: { meta: { cacheFor: SOFT_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: SOFT_FETCH })

              actions = store.getActions()

              log(configuration, maps)
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('does not invoke the "next" middleware with the action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(1)

              expect(actions)
                .not.to.deep.include({ type: SOFT_FETCH })
            })

            it('dispatches the `STORAGE_FETCH` action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(1)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: SOFT_FETCH,
                    accessedAt,
                    cachedAt,
                    cacheFor: SOFT_CACHE_FOR,
                    isSoftStorage
                  }
                })
            })

            it('returns the action', () => {
              expect(action).to.deep.equal({ type: SOFT_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          let configuration
          let maps

          const accessedAt = DATE_NOW
          const isSoftStorage = true

          beforeEach(() => {
            configuration = [
              { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
            ]

            maps = {
              fetchMap: new Map(),
              storeMap: new Map(),
              fetchMetaMap: new Map(),
              storeMetaMap: new Map(),
              clearMap: new Map()
            }

            sinon.stub(Date, 'now')
              .returns(DATE_NOW)

            store = configureStore([ storageMap(configuration, maps) ])({})

            action = store.dispatch({ type: SOFT_FETCH })

            actions = store.getActions()

            log(configuration, maps)
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the action', () => {
            actions.forEach((action) => console.table(action))

            expect(actions.length).to.equal(2)

            expect(actions)
              .to.deep.include({ type: SOFT_FETCH })
          })

          it('dispatches the `STORAGE_CLEAR` action', () => {
            actions.forEach((action) => console.table(action))

            expect(actions.length).to.equal(2)

            expect(actions)
              .to.deep.include({
                type: STORAGE_CLEAR,
                meta: {
                  type: SOFT_FETCH,
                  accessedAt,
                  cacheFor: SOFT_CACHE_FOR,
                  isSoftStorage
                }
              })
          })

          it('returns the action', () => {
            expect(action).to.deep.equal({ type: SOFT_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        let configuration
        let maps

        const accessedAt = DATE_NOW
        const cachedAt = DATE_NOW
        const isSoftStorage = true

        beforeEach(() => {
          configuration = [
            { type: SOFT_FETCH, meta: { type: SOFT_STORE, cacheFor: SOFT_CACHE_FOR } }
          ]

          maps = {
            fetchMap: new Map(),
            storeMap: new Map(),
            fetchMetaMap: new Map(),
            storeMetaMap: new Map(),
            clearMap: new Map()
          }

          sinon.stub(Date, 'now')
            .returns(DATE_NOW)

          store = configureStore([ storageMap(configuration, maps) ])({})

          action = store.dispatch({ type: SOFT_STORE })

          actions = store.getActions()

          log(configuration, maps)
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the action', () => {
          actions.forEach((action) => console.table(action))

          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: SOFT_STORE })
        })

        it('dispatches the `STORAGE_STORE` actions', () => {
          actions.forEach((action) => console.table(action))

          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({
              type: STORAGE_STORE,
              meta: {
                type: SOFT_STORE,
                accessedAt,
                cachedAt,
                cacheFor: SOFT_CACHE_FOR,
                isSoftStorage
              },
              data: { type: SOFT_STORE }
            })

          expect(actions)
            .to.deep.include({
              type: STORAGE_STORE,
              meta: {
                type: SOFT_FETCH,
                accessedAt,
                cachedAt,
                cacheFor: SOFT_CACHE_FOR,
                isSoftStorage
              }
            })
        })

        it('returns the action', () => {
          expect(action).to.deep.equal({ type: SOFT_STORE })
        })
      })
    })

    describe('State storage', () => {
      describe('Fetch', () => {
        describe('With state', () => {
          describe('The action is stale', () => {
            let store
            let action
            let actions

            let configuration
            let maps

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (STATE_CACHE_FOR + TIME_ONE_SECOND)

            beforeEach(() => {
              configuration = [
                { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
              ]

              maps = {
                fetchMap: new Map(),
                storeMap: new Map(),
                fetchMetaMap: new Map(),
                storeMetaMap: new Map(),
                clearMap: new Map()
              }

              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration, maps) ])({ reduxStorage: { [STATE_FETCH]: { meta: { cacheFor: STATE_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: STATE_FETCH })

              actions = store.getActions()

              log(configuration, maps)
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(2)

              expect(actions)
                .to.deep.include({ type: STATE_FETCH })
            })

            it('dispatches the `STORAGE_CLEAR` action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(2)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_CLEAR,
                  meta: {
                    type: STATE_FETCH,
                    accessedAt,
                    cachedAt,
                    cacheFor: STATE_CACHE_FOR
                  }
                })
            })

            it('returns the action', () => {
              expect(action).to.deep.equal({ type: STATE_FETCH })
            })
          })

          describe('The action is not stale', () => {
            let store
            let action
            let actions

            let configuration
            let maps

            const accessedAt = DATE_NOW
            const cachedAt = DATE_NOW - (STATE_CACHE_FOR - TIME_ONE_SECOND)

            beforeEach(() => {
              configuration = [
                { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
              ]

              maps = {
                fetchMap: new Map(),
                storeMap: new Map(),
                fetchMetaMap: new Map(),
                storeMetaMap: new Map(),
                clearMap: new Map()
              }

              sinon.stub(Date, 'now')
                .returns(DATE_NOW)

              store = configureStore([ storageMap(configuration, maps) ])({ reduxStorage: { [STATE_FETCH]: { meta: { cacheFor: STATE_CACHE_FOR, cachedAt, accessedAt } } } })

              action = store.dispatch({ type: STATE_FETCH })

              actions = store.getActions()

              log(configuration, maps)
            })

            afterEach(() => {
              Date.now.restore()
            })

            it('invokes the "next" middleware with the `STORAGE_FETCH` action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(1)

              expect(actions)
                .to.deep.include({
                  type: STORAGE_FETCH,
                  meta: {
                    type: STATE_FETCH,
                    accessedAt,
                    cachedAt,
                    cacheFor: STATE_CACHE_FOR
                  }
                })
            })

            it('does not dispatch the `STORAGE_CLEAR` action', () => {
              actions.forEach((action) => console.table(action))

              expect(actions.length).to.equal(1)

              expect(actions)
                .not.to.deep.include({
                  type: STORAGE_CLEAR,
                  meta: {
                    type: STATE_FETCH,
                    accessedAt,
                    cachedAt,
                    cacheFor: STATE_CACHE_FOR
                  }
                })
            })

            it('returns the action', () => {
              expect(action).to.deep.equal({ type: STATE_FETCH })
            })
          })
        })

        describe('Without state', () => {
          let store
          let action
          let actions

          let configuration
          let maps

          const accessedAt = DATE_NOW

          beforeEach(() => {
            configuration = [
              { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
            ]

            maps = {
              fetchMap: new Map(),
              storeMap: new Map(),
              fetchMetaMap: new Map(),
              storeMetaMap: new Map(),
              clearMap: new Map()
            }

            sinon.stub(Date, 'now')
              .returns(DATE_NOW)

            store = configureStore([ storageMap(configuration, maps) ])({})

            action = store.dispatch({ type: STATE_FETCH })

            actions = store.getActions()

            log(configuration, maps)
          })

          afterEach(() => {
            Date.now.restore()
          })

          it('invokes the "next" middleware with the action', () => {
            actions.forEach((action) => console.table(action))

            expect(actions.length).to.equal(2)

            expect(actions)
              .to.deep.include({ type: STATE_FETCH })
          })

          it('dispatches the `STORAGE_CLEAR` action', () => {
            actions.forEach((action) => console.table(action))

            expect(actions.length).to.equal(2)

            expect(actions)
              .to.deep.include({
                type: STORAGE_CLEAR,
                meta: {
                  type: STATE_FETCH,
                  accessedAt,
                  cacheFor: STATE_CACHE_FOR
                }
              })
          })

          it('returns the action', () => {
            expect(action).to.deep.equal({ type: STATE_FETCH })
          })
        })
      })

      describe('Store', () => {
        let store
        let action
        let actions

        let configuration
        let maps

        const accessedAt = DATE_NOW
        const cachedAt = DATE_NOW

        beforeEach(() => {
          configuration = [
            { type: STATE_FETCH, meta: { type: STATE_STORE, cacheFor: STATE_CACHE_FOR } }
          ]

          maps = {
            fetchMap: new Map(),
            storeMap: new Map(),
            fetchMetaMap: new Map(),
            storeMetaMap: new Map(),
            clearMap: new Map()
          }

          sinon.stub(Date, 'now')
            .returns(DATE_NOW)

          store = configureStore([ storageMap(configuration, maps) ])({})

          action = store.dispatch({ type: STATE_STORE })

          actions = store.getActions()

          log(configuration, maps)
        })

        afterEach(() => {
          Date.now.restore()
        })

        it('invokes the "next" middleware with the action', () => {
          actions.forEach((action) => console.table(action))

          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({ type: STATE_STORE })
        })

        it('dispatches the `STORAGE_STORE` actions', () => {
          actions.forEach((action) => console.table(action))

          expect(actions.length).to.equal(3)

          expect(actions)
            .to.deep.include({
              type: STORAGE_STORE,
              meta: {
                type: STATE_STORE,
                accessedAt,
                cachedAt,
                cacheFor: STATE_CACHE_FOR
              },
              data: { type: STATE_STORE }
            })

          expect(actions)
            .to.deep.include({
              type: STORAGE_STORE,
              meta: {
                type: STATE_FETCH,
                accessedAt,
                cachedAt,
                cacheFor: STATE_CACHE_FOR
              }
            })
        })

        it('returns the action', () => {
          expect(action).to.deep.equal({ type: STATE_STORE })
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
      actions.forEach((action) => console.table(action))

      expect(actions.length).to.equal(1)

      expect(actions)
        .to.deep.include({ type: TYPE })
    })

    it('returns the action', () => {
      expect(action).to.deep.equal({ type: TYPE })
    })
  })

  describe('initialise()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialise).to.be.a('function')
      })
    })
  })

  describe('initialiseFetch()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseFetch).to.be.a('function')
      })
    })
  })

  describe('initialiseStore()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseStore).to.be.a('function')
      })
    })
  })

  describe('initialiseClear()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseClear).to.be.a('function')
      })
    })
  })

  describe('initialiseFetchStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseFetchStorage).to.be.a('function')
      })
    })
  })

  describe('initialiseFetchHardStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseFetchHardStorage).to.be.a('function')
      })
    })
  })

  describe('initialiseFetchSoftStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseFetchSoftStorage).to.be.a('function')
      })
    })
  })

  describe('initialiseFetchMetaMap()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseFetchMetaMap).to.be.a('function')
      })
    })
  })

  describe('initialiseStoreStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseStoreStorage).to.be.a('function')
      })
    })
  })

  describe('initialiseStoreHardStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseStoreHardStorage).to.be.a('function')
      })
    })
  })

  describe('initialiseStoreSoftStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseStoreSoftStorage).to.be.a('function')
      })
    })
  })

  describe('initialiseStoreNotFetchMap()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseStoreNotFetchMap).to.be.a('function')
      })
    })
  })

  describe('initialiseStoreMetaMap()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseStoreMetaMap).to.be.a('function')
      })
    })
  })

  describe('initialiseClearIsUniqueMap()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(initialiseClearIsUniqueMap).to.be.a('function')
      })
    })
  })

  describe('min()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(min).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(max).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(isStale).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(isHardStorage).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(isSoftStorage).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(hasComparator).to.be.a('function')
      })
    })

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
      it('is a function', () => {
        expect(filterFor).to.be.a('function')
      })

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
      it('is a function', () => {
        expect(filterMetaFor).to.be.a('function')
      })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(mapType).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(mapMetaType).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(mapCacheFor).to.be.a('function')
      })
    })

    describe('With configuration', () => {
      describe('The configuration has a "cacheFor" value', () => {
        it('returns the value', () => {
          const cacheFor = CACHE_FOR

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
    describe('Always', () => {
      it('is a function', () => {
        expect(mapCachedAt).to.be.a('function')
      })
    })

    describe('With configuration', () => {
      describe('The configuration has a "cachedAt" value', () => {
        it('returns the value', () => {
          const cachedAt = CACHED_AT

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
    describe('Always', () => {
      it('is a function', () => {
        expect(createIsHardStorage).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(createIsSoftStorage).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(createComparator).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(createAccessedAt).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(createCachedAt).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(createCacheFor).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(createMeta).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(hasCacheFor).to.be.a('function')
      })
    })

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
    describe('Always', () => {
      it('is a function', () => {
        expect(notCacheFor).to.be.a('function')
      })
    })

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

  describe('filterFetch()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterFetch).to.be.a('function')
      })
    })
  })

  describe('filterStore()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterStore).to.be.a('function')
      })
    })
  })

  describe('filterClear()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterClear).to.be.a('function')
      })
    })
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

    describe('Always', () => {
      it('is a function', () => {
        expect(dedupeFetch).to.be.a('function')
      })
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

          expect(map).to.equal(mapMetaType)
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

        expect(map).to.equal(mapMetaType)
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

    describe('Always', () => {
      it('is a function', () => {
        expect(dedupeStore).to.be.a('function')
      })
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

    describe('Always', () => {
      it('is a function', () => {
        expect(dedupeClear).to.be.a('function')
      })
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

  describe('filterHardStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterHardStorage).to.be.a('function')
      })
    })
  })

  describe('filterSoftStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterSoftStorage).to.be.a('function')
      })
    })
  })

  describe('filterStorage()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterStorage).to.be.a('function')
      })
    })
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

  describe('filterHardStorageArray()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterHardStorageArray).to.be.a('function')
      })

      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterHardStorageArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterHardStorageArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterHardStorageArray(array)

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

  describe('filterSoftStorageArray()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterSoftStorageArray).to.be.a('function')
      })

      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterSoftStorageArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterSoftStorageArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterSoftStorageArray(array)

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

  describe('filterStorageArray()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(filterStorageArray).to.be.a('function')
      })

      describe('With parameters', () => {
        it('returns an array', () => {
          expect(filterStorageArray([]))
        })
      })

      describe('Without parameters', () => {
        it('returns an array', () => {
          expect(filterStorageArray())
        })
      })
    })

    describe('An array is passed as an argument', () => {
      it('Filters the array', () => {
        const array = []
        sinon.stub(array, 'filter')

        filterStorageArray(array)

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
      it('is a function', () => {
        expect(filterFetchArray).to.be.a('function')
      })

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
      it('is a function', () => {
        expect(filterStoreArray).to.be.a('function')
      })

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
      it('is a function', () => {
        expect(filterClearArray).to.be.a('function')
      })

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
      it('is a function', () => {
        expect(filterNotFetchMapArray).to.be.a('function')
      })

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
      it('is a function', () => {
        expect(filterIsUniqueMapArray).to.be.a('function')
      })

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

  describe('createFetchMetaArray()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(createFetchMetaArray).to.be.a('function')
      })

      describe('An array is passed as an argument', () => {
        it('returns an array', () => {
          expect(createFetchMetaArray([])).to.be.an('array')
        })
      })

      describe('An array is not passed as an argument', () => {
        it('returns an array', () => {
          expect(createFetchMetaArray()).to.be.an('array')
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

      it('calls reduce with "reduceMetaFetch" and an array', () => {
        createFetchMetaArray(one)

        const {
          reduce: {
            firstCall: {
              args: [ ONE, TWO ]
            }
          }
        } = one

        expect(ONE).to.equal(reduceMetaFetch)
        expect(TWO).to.be.an('array')
      })

      it('calls reduce with "dedupeMetaFetch" and an array', () => {
        createFetchMetaArray(one)

        const {
          reduce: {
            secondCall: {
              args: [ ONE, TWO ]
            }
          }
        } = one

        expect(ONE).to.equal(dedupeMetaFetch)
        expect(TWO).to.be.an('array')
      })
    })
  })

  describe('createStoreMetaArray()', () => {
    describe('Always', () => {
      it('is a function', () => {
        expect(createStoreMetaArray).to.be.a('function')
      })

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

      it('calls reduce with "reduceMetaStore" and an array', () => {
        createStoreMetaArray(one)

        const {
          reduce: {
            firstCall: {
              args: [ ONE, TWO ]
            }
          }
        } = one

        expect(ONE).to.equal(reduceMetaStore)
        expect(TWO).to.be.an('array')
      })

      it('calls reduce with "dedupeMetaStore" and an array', () => {
        createStoreMetaArray(one)

        const {
          reduce: {
            secondCall: {
              args: [ ONE, TWO ]
            }
          }
        } = one

        expect(ONE).to.equal(dedupeMetaStore)
        expect(TWO).to.be.an('array')
      })
    })
  })
})
