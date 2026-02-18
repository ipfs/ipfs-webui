/**
 * Reads setting from the `localStorage` with a given `id` as JSON. If JSON
 * parse is failed setting is interpreted as a string value.
 * @param {string} id
 * @returns {string|object|null}
 */
export const readSetting = (id) => {
  /** @type {string|null} */
  let setting = null
  if (window.localStorage) {
    try {
      setting = window.localStorage.getItem(id)
    } catch (error) {
      console.error(`Error reading '${id}' value from localStorage`, error)
    }

    try {
      return JSON.parse(setting || '')
    } catch (_) {
      // res was probably a string, so pass it on.
      return setting
    }
  }

  return setting
}

/**
 * @param {string} id
 * @param {string|number|boolean|object} value
 */
export const writeSetting = (id, value) => {
  try {
    window.localStorage.setItem(id, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing '${id}' value to localStorage`, error)
  }
}
