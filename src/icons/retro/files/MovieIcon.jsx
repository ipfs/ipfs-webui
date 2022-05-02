const MovieIcon = ({ color = 'white', ...rest }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" clipRule="evenodd" d="M3 3H21V21H3V3ZM5 5V7H7V5H5ZM9 5V11H15V5H9ZM17 5V7H19V5H17ZM19 9H17V11H19V9ZM19 13H17V15H19V13ZM19 17H17V19H19V17ZM15 19V13H9V19H15ZM7 19V17H5V19H7ZM5 15H7V13H5V15ZM5 11H7V9H5V11Z" fill={color} />
  </svg>
)

export default MovieIcon
