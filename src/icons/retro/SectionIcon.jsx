const SectionIcon = props => (
  <svg width="7" height="7" viewBox="0 0 3 5" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="1" y="2" width="1" height="1" transform="rotate(90 1 2)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="1" y="1" width="1" height="1" transform="rotate(90 1 1)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="1" width="1" height="1" transform="rotate(90 1 0)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="2" y="1" width="1" height="1" transform="rotate(90 2 1)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="2" y="2" width="1" height="1" transform="rotate(90 2 2)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="2" y="3" width="1" height="1" transform="rotate(90 2 3)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="3" y="2" width="1" height="1" transform="rotate(90 3 2)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="1" y="3" width="1" height="1" transform="rotate(90 1 3)" fill={props.color ? props.color : '#1E1E1E'} />
    <rect x="1" y="4" width="1" height="1" transform="rotate(90 1 4)" fill={props.color ? props.color : '#1E1E1E'} />
  </svg>
)

export default SectionIcon
