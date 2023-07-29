import HardStorage from '#components/storage/hard-storage'
import SoftStorage from '#components/storage/soft-storage'

function initialHardStorageState (state = {}) {
  const hardStorage = HardStorage()
  let i = 0
  const j = hardStorage.length

  for (i, j; i < j; i = i + 1) {
    const type = hardStorage.key(i)
    const item = hardStorage.getItem(type)
    try {
      const {
        meta,
        data
      } = JSON.parse(item)

      if ((meta || false) instanceof Object) {
        state = { ...state, [type]: { meta: { ...meta, type }, ...(data ? { data } : {}) } }
      }
    } catch (e) {
      void e
    }
  }

  return state
}

function initialSoftStorageState (state = {}) {
  const softStorage = SoftStorage()
  let i = 0
  const j = softStorage.length

  for (i, j; i < j; i = i + 1) {
    const type = softStorage.key(i)
    const item = softStorage.getItem(type)
    try {
      const {
        meta,
        data
      } = JSON.parse(item)

      if ((meta || false) instanceof Object) {
        state = { ...state, [type]: { meta: { ...meta, type }, ...(data ? { data } : {}) } }
      }
    } catch (e) {
      void e
    }
  }

  return state
}

export default () => initialSoftStorageState(initialHardStorageState())
