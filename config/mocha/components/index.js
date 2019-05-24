import { expect } from 'chai'
import sinon from 'sinon'

import Storage from 'redux-storage-middleware/components/storage'

describe('Redux Storage Middleware - Components - Storage', () => {
  describe('Always', () => {
    it('is the class', () => {
      expect(Storage).to.be.a('function')
    })
  })

  describe('Storage', () => {
    let map
    let storage

    beforeEach(() => {
      map = new Map()
      storage = new Storage(map)
    })

    describe('Get Item', () => {
      describe('Item is in Storage', () => {
        beforeEach(() => {
          sinon.stub(map, 'has').returns(true)
          sinon.stub(map, 'get').returns('Mock Value')
          map.set('Mock Key', 'Mock Value')
        })

        afterEach(() => {
          map.get.restore()
          map.has.restore()
          map.clear()
        })

        it('invokes the "has" function', () => {
          storage.getItem('Mock Key')

          expect(map.has)
            .to.be.calledWith('Mock Key')
        })

        it('invokes the "get" function', () => {
          storage.getItem('Mock Key')

          expect(map.get)
            .to.be.calledWith('Mock Key')
        })

        it('returns a string', () => {
          expect(storage.getItem('Mock Key'))
            .to.equal('Mock Value')
        })
      })

      describe('Item is not in Storage', () => {
        beforeEach(() => {
          sinon.stub(map, 'has').returns(false)
          sinon.stub(map, 'get')
        })

        afterEach(() => {
          map.get.restore()
          map.has.restore()
        })

        it('invokes the "has" function', () => {
          storage.getItem('Mock Key')

          expect(map.has)
            .to.be.calledWith('Mock Key')
        })

        it('does not invoke the "get" function', () => {
          storage.getItem('Mock Key')

          expect(map.get)
            .not.to.be.called
        })

        it('returns null', () => {
          expect(storage.getItem('Mock Key'))
            .to.be.null
        })
      })
    })

    describe('Set Item', () => {
      it('sets the key and value', () => {
        sinon.stub(map, 'set')

        storage.setItem('Mock Key', 'Mock Value')

        expect(map.set)
          .to.be.calledWith('Mock Key', 'Mock Value')

        map.set.restore()
      })
    })

    describe('Remove Item', () => {
      it('removes the key and value', () => {
        sinon.stub(map, 'delete')

        storage.removeItem('Mock Key')

        expect(map.delete)
          .to.be.calledWith('Mock Key')

        map.delete.restore()
      })
    })

    describe('Key', () => {
      it('invokes the "keys" function', () => {
        sinon.stub(map, 'keys').returns([])

        storage.key(0)

        expect(map.keys)
          .to.be.called

        map.keys.restore()
      })

      it('gets the key at the index', () => {
        map.set('Mock Key', 'Mock Value')

        expect(storage.key(0))
          .to.equal('Mock Key')
      })
    })

    describe('Clear', () => {
      it('clears the map', () => {
        sinon.stub(map, 'clear')

        storage.clear()

        expect(map.clear)
          .to.be.called

        map.clear.restore()
      })
    })

    describe('Length', () => {
      describe('Storage has zero items', () => {
        it('has zero items', () => {
          map.clear()

          expect(storage.length)
            .to.eql(0)
        })
      })

      describe('Storage has one item', () => {
        it('has one item', () => {
          map.set('one', {})

          expect(storage.length)
            .to.eql(1)
        })
      })

      describe('Storage has more items', () => {
        it('has more items', () => {
          map.set('one', {}).set('two', {}).set('three', {})

          expect(storage.length)
            .to.eql(3)
        })
      })
    })
  })
})
