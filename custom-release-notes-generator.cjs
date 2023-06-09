/* eslint-disable import/esm-extensions */
// @ts-check

const config = require('conventional-changelog-conventionalcommits')
const { readFileSync } = require('fs')

/**
 * @typedef {import('conventional-changelog-conventionalcommits')} ConventionalChangelogConventionalcommits
 * @typedef {Exclude<Awaited<ReturnType<ConventionalChangelogConventionalcommits>>, undefined>} ConventionalChangelogConventionalcommitsReturnType
 * @typedef {Parameters<ConventionalChangelogConventionalcommits>[0]} ConventionalChangelogConventionalcommitsOptions
 */

/**
 * @returns {string}
 */
const getCID = () => {
  try {
    const cid = readFileSync('.cid', 'utf8')
    return cid.trim()
  } catch (err) {
    console.log('err', err)
    return ''
  }
}

/**
 *
 * @param {ConventionalChangelogConventionalcommitsOptions} options
 */
module.exports = async (options) => {
  const defaultConfig = /** @type {ConventionalChangelogConventionalcommitsReturnType} */(await config(options))

  const { writerOpts } = defaultConfig
  const { mainTemplate, commitPartial, footerPartial } = writerOpts
  let { headerPartial } = writerOpts

  headerPartial += `\n\n CID \`${getCID()}\`\n\n --- \n\n`

  return {
    ...defaultConfig,
    writerOpts: {
      ...writerOpts,
      headerPartial,
      mainTemplate,
      commitPartial,
      footerPartial
    }
  }
}
