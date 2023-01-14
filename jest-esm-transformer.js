// const path = require('path')

// const babelTransform = require('react-app-rewired/scripts/utils/babelTransform')
// const cssTransform = require('react-scripts/config/jest/cssTransform')
// const fileTransform = require('react-scripts/config/jest/fileTransform')

// const esmOptions = { force: true, mainFields: ['main', 'exports'] }
// const esmJSON = JSON.stringify()
module.exports = {
  process (sourceText, sourcePath, options) {
    console.log('process sourcePath: ', sourcePath)
    // if (sourcePath.includes('ipfsd-ctl')) {
    //   throw new Error('test123')
    // }
    return {
      code: `
        module.exports = require("esm")(module, { force: true, mainFields: ['main', 'exports'] })("${sourcePath}")
        `
    }
  },
  async processAsync (sourceText, sourcePath, options) {
    console.log('processAsync sourcePath: ', sourcePath)
    // if (sourcePath.includes('kubo-rpc-client')) {
    //   this.process.exit(1)
    //   throw new Error('test123')
    // }

    return {
      code: `
        require = require("esm")(module/*, options*/)
        module.exports = require("${sourcePath}")
        `
    }
    // if (/^.+\\.(js|jsx|mjs|cjs|ts|tsx)$/.test(sourcePath)) {
    //   return await babelTransform.processAsync(sourceText, sourcePath, options)
    // } else if (/^.+\\.css$/.test(sourcePath)) {
    //   return await cssTransform.processAsync(sourceText, sourcePath, options)
    // } else if (/^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)/.test(sourcePath)) {
    //   return await fileTransform.processAsync(sourceText, sourcePath, options)
    // }
    // return {
    //   code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`
    // }
  }
}
