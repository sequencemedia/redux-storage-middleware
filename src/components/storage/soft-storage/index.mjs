import Storage from '#components/storage'

export default () => ('sessionStorage' in global)
  ? sessionStorage
  : new Storage()
