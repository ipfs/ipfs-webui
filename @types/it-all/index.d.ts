declare module "it-all" {
  function all<T>(source: AsyncIterable<T>): Promise<T[]>

  export default all
}