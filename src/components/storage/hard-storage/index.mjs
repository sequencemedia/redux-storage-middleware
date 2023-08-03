import Storage from '#components/storage'

export default () => {
  try {
    return ('localStorage' in window)
      ? localStorage
      : new Storage()
  } catch {
    return ('localStorage' in global)
      ? localStorage
      : new Storage()
  }
}
