/* eslint-env mocha */
/* eslint no-unused-vars: 0, no-unused-expressions: 0, no-shadow: 0 */

import { expect } from 'chai'
import sinon from 'sinon'

import {
  STORAGE_COMPARE,
  STORAGE_FETCH,
  STORAGE_STORE,
  STORAGE_CLEAR
} from 'redux-storage-middleware/actions'

import reducer from 'redux-storage-middleware/reducer'

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
      describe('Compare', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has a "comparedAt" value', () => {
          it('changes the state of the meta property type with the "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = { [type]: { meta: { ...meta, comparedAt: comparedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isHardStorage, comparedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, comparedAt } } })
          })
        })

        describe('The action meta property does not have a "comparedAt" value', () => {
          it('changes the state of the meta property type with a "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = { [type]: { meta: { ...meta, comparedAt: comparedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, comparedAt } } })
          })
        })
      })

      describe('Fetch', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has an "accessedAt" value', () => {
          it('changes the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('changes the state of the meta property type with an "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, accessedAt } } })
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
              .to.eql({ [type]: { meta: { ...meta, cachedAt } } })
          })
        })

        describe('The action meta property does not have an "cachedAt" value', () => {
          it('changes the state of the meta property type with a "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, cachedAt } } })
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
      describe('Compare', () => {
        describe('The action meta property has a "comparedAt" value', () => {
          it('creates the state of the meta property type with the "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isHardStorage, comparedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { comparedAt } } })
          })
        })

        describe('The action meta property does not have a "comparedAt" value', () => {
          it('creates the state of the meta property type with a "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { comparedAt } } })
          })
        })
      })

      describe('Fetch', () => {
        describe('The action meta property has an "accessedAt" value', () => {
          it('creates the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('creates the state of the meta property type with an "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { accessedAt } } })
          })
        })
      })

      describe('Store', () => {
        describe('The action meta property has a "cachedAt" value', () => {
          it('creates the state of the meta property type with the "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isHardStorage, cachedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { cachedAt } } })
          })
        })

        describe('The action meta property does not have a "cachedAt" value', () => {
          it('creates the state of the meta property type with a "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isHardStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { cachedAt } } })
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
      describe('Compare', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has a "comparedAt" value', () => {
          it('changes the state of the meta property type with the "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = { [type]: { meta: { ...meta, comparedAt: comparedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isSoftStorage, comparedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, comparedAt } } })
          })
        })

        describe('The action meta property does not have a "comparedAt" value', () => {
          it('changes the state of the meta property type with a "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = { [type]: { meta: { ...meta, comparedAt: comparedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, comparedAt } } })
          })
        })
      })

      describe('Fetch', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has an "accessedAt" value', () => {
          it('changes the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('changes the state of the meta property type with an "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, accessedAt } } })
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
              .to.eql({ [type]: { meta: { ...meta, cachedAt } } })
          })
        })

        describe('The action meta property does not have an "cachedAt" value', () => {
          it('changes the state of the meta property type with a "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, cachedAt } } })
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
      describe('Compare', () => {
        describe('The action meta property has a "comparedAt" value', () => {
          it('changes the state of the meta property type with the "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isSoftStorage, comparedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { comparedAt } } })
          })
        })

        describe('The action meta property does not have a "comparedAt" value', () => {
          it('changes the state of the meta property type with a "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { comparedAt } } })
          })
        })
      })

      describe('Fetch', () => {
        describe('The action meta property has an "accessedAt" value', () => {
          it('creates the state of the meta property type with the "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage, accessedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { accessedAt } } })
          })
        })

        describe('The action meta property does not have an "accessedAt" value', () => {
          it('creates the state of the meta property type with an "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { accessedAt } } })
          })
        })
      })

      describe('Store', () => {
        describe('The action meta property has a "cachedAt" value', () => {
          it('creates the state of the meta property type with the "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isSoftStorage, cachedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { cachedAt } } })
          })
        })

        describe('The action meta property does not have a "cachedAt" value', () => {
          it('creates the state of the meta property type with a "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, isSoftStorage } })

            expect(now)
              .to.eql({ [type]: { meta: { cachedAt } } })
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
      describe('Compare', () => {
        const meta = { cachedAt: 0, cacheFor: 0 }

        describe('The action meta property has a "comparedAt" value', () => {
          it('changes the state of the meta property type with the "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = { [type]: { meta: { ...meta, comparedAt: comparedAt - ONE_DAY }, data: { type } } }
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, comparedAt } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, comparedAt }, data: { type } } })
          })
        })

        describe('The action meta property does not have a "comparedAt" value', () => {
          it('changes the state of the meta property type with a "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = { [type]: { meta: { ...meta, comparedAt: comparedAt - ONE_DAY }, data: { type } } }
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, comparedAt }, data: { type } } })
          })
        })
      })

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
          it('changes the state of the meta property type with an "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = { [type]: { meta: { ...meta, accessedAt: accessedAt - ONE_DAY }, data: { type } } }
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, accessedAt }, data: { type } } })
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
          it('changes the state of the meta property type with a "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = { [type]: { meta: { ...meta, cachedAt: cachedAt - ONE_DAY } } }
            const now = reducer(was, { type: STORAGE_STORE, meta: { type }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { ...meta, type, cachedAt }, data: { type } } })
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
      describe('Compare', () => {
        describe('The action meta property has a "comparedAt" value', () => {
          it('creates the state of the meta property type with the "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type, comparedAt }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type, comparedAt }, data: { type } } })
          })
        })

        describe('The action meta property does not have a "comparedAt" value', () => {
          it('creates the state of the meta property type with a "comparedAt" value', () => {
            const comparedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_COMPARE, meta: { type }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type, comparedAt }, data: { type } } })
          })
        })
      })

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
          it('changes the state of the meta property type with an "accessedAt" value', () => {
            const accessedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_FETCH, meta: { type }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type, accessedAt }, data: { type } } })
          })
        })
      })

      describe('Store', () => {
        describe('The action meta property has a "cachedAt" value', () => {
          it('creates the state of the meta property type with the "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type, cachedAt }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type, cachedAt }, data: { type } } })
          })
        })

        describe('The action meta property does not have a "cachedAt" value', () => {
          it('creates the state of the meta property type with a "cachedAt" value', () => {
            const cachedAt = Date.now()

            const was = {}
            const now = reducer(was, { type: STORAGE_STORE, meta: { type }, data: { type } })

            expect(now)
              .to.eql({ [type]: { meta: { type, cachedAt }, data: { type } } })
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
