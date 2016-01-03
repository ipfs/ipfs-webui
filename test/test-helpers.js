import chai, {expect} from 'chai'
import jsxChai from 'jsx-chai'
import {createRenderer} from 'react-addons-test-utils'

chai.use(jsxChai)

export function shallowRender (comp) {
  const renderer = createRenderer()
  renderer.render(comp)
  return renderer.getRenderOutput()
}

export {expect}
