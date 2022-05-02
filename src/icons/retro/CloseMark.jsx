const CloseMark = ({ color = '#1E1E1E', ...props }) => (
  <svg width="8" height="7" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="2" height="1" fill={color} />
    <rect x="1" y="1" width="2" height="1" fill={color} />
    <rect x="1" y="5" width="2" height="1" fill={color} />
    <rect y="6" width="2" height="1" fill={color} />
    <rect x="2" y="2" width="4" height="1" fill={color} />
    <rect x="2" y="4" width="4" height="1" fill={color} />
    <rect x="3" y="3" width="2" height="1" fill={color} />
    <rect x="5" y="1" width="2" height="1" fill={color} />
    <rect x="5" y="5" width="2" height="1" fill={color} />
    <rect x="6" y="6" width="2" height="1" fill={color} />
    <rect x="6" width="2" height="1" fill={color} />
  </svg>
)

export default CloseMark
