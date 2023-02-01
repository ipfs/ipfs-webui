import * as enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

const { configure } = enzyme.default
configure({ adapter: new Adapter() })
