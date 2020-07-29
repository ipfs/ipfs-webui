declare module "it-last" {
  declare function last<T>(input: AsyncIterable<T>): Promise<T>

  export default last
}