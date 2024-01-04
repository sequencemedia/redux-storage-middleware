import { use, expect } from 'chai'
import sinon from 'sinon'
import sinonChai from '@sequencemedia/sinon-chai'

import {
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from '#actions'

import reducer from '#reducer'

use(sinonChai)

describe('Redux Storage Middleware - Reducer', () => {
  const ONE_DAY = (1000 * 60 * 60 * 24)

  describe('Always', () => {
    it('is the reducer', () => {
      expect(reducer).to.be.a('function')
    })

    it('returns the state', () => {
      expect(reducer()).to.be.an('object')
    })
  })

  describe('Hard storage', () => {
    const type = 'HARD_ACTION'
    const isHardStorage = true

    beforeEach(() => {
      const NOW = Date.now()

      sinon.stub(Date, 'now')
        .returns(NOW)
    })

    afterEach(() => {
      Date.now.restore()
    })

    describe('With state', () => {
      describe('Fetch', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has an "accessedAt" value', () => {
          it('changes the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isHardStorage, accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('does not change the state of the meta property type "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isHardStorage, accessedAt: accessedAt - ONE_DAY } } })
          })
        })
      })

      describe('Store', () => {
        const meta = { cacheFor: 0 }

        describe('The action meta property has an "cachedAt" value', () => {
          it('changes the state of the meta property type with the "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isHardStorage, cachedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isHardStorage, cachedAt } } })
          })
        })

        describe('The action meta property does not have an "cachedAt" value', () => {
          it('does not change the state of the meta property type "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isHardStorage, cachedAt: cachedAt - ONE_DAY } } })
          })
        })
      })

      describe('Clear', () => {
        it('clears the state of the meta property type', () => {
          const was = { [type]: { meta: { cachedAt: 0, cacheFor: 0 } } }
          const now = reducer(was, { type: STORAGE_CLEAR, meta: { type, isHardStorage } })

          expect(now)
            .to.eql({})
        })
      })
    })

    describe('Without state', () => {
      describe('Fetch', () => {
        describe('The action meta property has an "accessedAt" value', () => {
          it('creates the state of the meta property type "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isHardStorage, accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('does not create a meta property type "accessedAt" value', () => {
            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isHardStorage } } })
          })
        })
      })

      describe('Store', () => {
        describe('The action meta property has a "cachedAt" value', () => {
          it('creates the state of the meta property type "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isHardStorage, cachedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isHardStorage, cachedAt } } })
          })
        })

        describe('The action meta property does not have a "cachedAt" value', () => {
          it('does not create a meta property type "cachedAt" value', () => {
            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isHardStorage } } })
          })
        })
      })

      describe('Clear', () => {
        it('does not change the state', () => {
          const was = {}
          const now = reducer(was, { type: STORAGE_CLEAR, meta: { type, isHardStorage } })

          expect(now)
            .to.eql(was)
        })
      })
    })
  })

  describe('Soft storage', () => {
    const type = 'SOFT_ACTION'
    const isSoftStorage = true

    beforeEach(() => {
      const NOW = Date.now()

      sinon.stub(Date, 'now')
        .returns(NOW)
    })

    afterEach(() => {
      Date.now.restore()
    })

    describe('With state', () => {
      describe('Fetch', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has an "accessedAt" value', () => {
          it('changes the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isSoftStorage, accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('does not change the state of the meta property type "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isSoftStorage, accessedAt: accessedAt - ONE_DAY } } })
          })
        })
      })

      describe('Store', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has an "cachedAt" value', () => {
          it('changes the state of the meta property type with the "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isSoftStorage, cachedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isSoftStorage, cachedAt } } })
          })
        })

        describe('The action meta property does not have an "cachedAt" value', () => {
          it('does not change the state of the meta property type "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, isSoftStorage, cachedAt: cachedAt - ONE_DAY } } })
          })
        })
      })

      describe('Clear', () => {
        it('clears the state of the meta property type', () => {
          const was = { [type]: {} }
          const now = reducer(was, { type: STORAGE_CLEAR, meta: { type, isSoftStorage } })

          expect(now)
            .to.eql({})
        })
      })
    })

    describe('Without state', () => {
      describe('Fetch', () => {
        describe('The action meta property has an "accessedAt" value', () => {
          it('creates the state of the meta property type "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isSoftStorage, accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('does not create a meta property type "accessedAt" value', () => {
            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isSoftStorage } } })
          })
        })
      })

      describe('Store', () => {
        describe('The action meta property has a "cachedAt" value', () => {
          it('creates the state of the meta property type "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isSoftStorage, cachedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isSoftStorage, cachedAt } } })
          })
        })

        describe('The action meta property does not have a "cachedAt" value', () => {
          it('does not create a meta property type "cachedAt" value', () => {
            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { type, isSoftStorage } } })
          })
        })
      })

      describe('Clear', () => {
        it('does not change the state', () => {
          const was = {}
          const now = reducer(was, { type: STORAGE_CLEAR, meta: { type, isSoftStorage } })

          expect(now)
            .to.eql(was)
        })
      })
    })
  })

  describe('State storage', () => {
    const type = 'STATE_ACTION'

    beforeEach(() => {
      const NOW = Date.now()

      sinon.stub(Date, 'now')
        .returns(NOW)
    })

    afterEach(() => {
      Date.now.restore()
    })

    describe('With state', () => {
      describe('Fetch', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has an "accessedAt" value', () => {
          it('changes the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY }, data: { type } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, accessedAt }, data: { type } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('does not change the state of the meta property type "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY }, data: { type } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, accessedAt: accessedAt - ONE_DAY }, data: { type } } })
          })
        })
      })

      describe('Store', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has an "cachedAt" value', () => {
          it('changes the state of the meta property type with the "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, cachedAt }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, cachedAt }, data: { type } } })
          })
        })

        describe('The action meta property does not have an "cachedAt" value', () => {
          it('does not change the state of the meta property type "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, cachedAt: cachedAt - ONE_DAY }, data: { type } } })
          })
        })
      })

      describe('Clear', () => {
        it('clears the state of the meta property type', () => {
          const was = { [type]: {} }
          const now = reducer(was, { type: STORAGE_CLEAR, meta: { type }, data: { type } })

          expect(now)
            .to.eql({})
        })
      })
    })

    describe('Without state', () => {
      describe('Fetch', () => {
        describe('The action meta property has an "accessedAt" value', () => {
          it('changes the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, accessedAt }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type, accessedAt }, data: { type } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('does not create a meta property type "accessedAt" value', () => {
            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type }, data: { type } } })
          })
        })
      })

      describe('Store', () => {
        describe('The action meta property has a "cachedAt" value', () => {
          it('creates the state of the meta property type "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, cachedAt }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type, cachedAt }, data: { type } } })
          })
        })

        describe('The action meta property does not have a "cachedAt" value', () => {
          it('does not create a meta property type "cachedAt" value', () => {
            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type }, data: { type } } })
          })
        })
      })

      describe('Clear', () => {
        it('does not change the state', () => {
          const was = {}
          const now = reducer(was, { type: STORAGE_CLEAR, meta: { type }, data: { type } })

          expect(now)
            .to.eql(was)
        })
      })
    })
  })
})
