const TextIcon = ({ color = 'white', ...rest }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" clipRule="evenodd" d="M5 2H19H21V4V20V22H19H5H3V20V4V2H5ZM19 20V4H5V20H19ZM7 6H17V8H7V6ZM17 10H7V12H17V10ZM7 14H14V16H7V14Z" fill={color} />
  </svg>
)

export default TextIcon
