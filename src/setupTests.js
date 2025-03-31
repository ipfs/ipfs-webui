import * as enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { TextDecoder, TextEncoder } from 'util';

const { configure } = enzyme.default;
configure({ adapter: new Adapter() });

globalThis.TextDecoder = global.TextDecoder = TextDecoder;
globalThis.TextEncoder = global.TextEncoder = TextEncoder;
