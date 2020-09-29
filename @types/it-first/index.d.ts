declare module "it-first" {
  function first<T>(input: AsyncIterable<T>): Promise<T>

  export default first
}
