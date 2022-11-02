/**
 *
 * @param {(msg, testFn) => } test - test function to wrap
 * @returns
 */
const getConditionalTest = (test) => (condition) => condition ? test : test.skip

export {
  getConditionalTest
}
