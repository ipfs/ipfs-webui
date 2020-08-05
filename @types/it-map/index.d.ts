declare module "it-map" {
  function map<I, O>(input: AsyncIterable<I>, f: (input: I) => O): AsyncIterable<O>
  export default map
}