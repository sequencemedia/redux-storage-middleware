import Storage from '#components/storage'

export default () => ('localStorage' in global)
  ? localStorage
  : new Storage()
