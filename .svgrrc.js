export default {
  typescript: true,
  ext: 'tsx',
  template: ({ imports, interfaces, componentName, props, jsx }, { tpl }) => {
    return tpl`
      import React from 'react'
      import type { SVGProps } from 'react'
      ${interfaces}
      const ${componentName} = (${props}) => (
        ${jsx}
      )
      export default ${componentName}
    `
  }
}
