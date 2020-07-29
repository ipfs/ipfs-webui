declare module "it-map" {
  declare function map<I, O>(input: AsyncIterable<I>, f: (input: I) => O): AsyncIterable<O>
  declare export default map
}