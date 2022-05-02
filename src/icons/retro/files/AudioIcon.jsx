const AudioIcon = ({ color = 'white', ...rest }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" clipRule="evenodd" d="M8 4H20V20H12V12H18V8H10V20H2V12H8V4ZM8 14H4V18H8V14ZM18 14H14V18H18V14Z" fill={color} />
  </svg>
)

export default AudioIcon
