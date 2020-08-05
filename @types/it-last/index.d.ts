declare module "it-last" {
  function last<T>(input: AsyncIterable<T>): Promise<T>

  export default last
}