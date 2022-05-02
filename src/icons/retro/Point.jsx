const Point = ({ color, ...rest }) => (
  <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <rect x="1" width="4" height="1" fill={color} />
    <rect y="1" width="6" height="1" fill={color} />
    <rect y="2" width="6" height="1" fill={color} />
    <rect y="3" width="6" height="1" fill={color} />
    <rect y="4" width="6" height="1" fill={color} />
    <rect x="1" y="5" width="4" height="1" fill={color} />
  </svg>
)

export default Point
