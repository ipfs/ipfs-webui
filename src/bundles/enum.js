// @ts-check

/**
 * @template {string} T
 * @param {T[]} variants
 * @returns {{[K in T]: K}}
 */
export const from = (variants) => variants.reduce((result, key) => {
  result[key] = key
  return result
}, Object.create(null))
