import Storage from '#components/storage'

export default () => {
  try {
    return ('sessionStorage' in window)
      ? sessionStorage
      : new Storage()
  } catch {
    return ('sessionStorage' in global)
      ? sessionStorage
      : new Storage()
  }
}
