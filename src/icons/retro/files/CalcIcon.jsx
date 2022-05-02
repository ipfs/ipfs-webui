const CalcIcon = ({ color = 'white', ...rest }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" clipRule="evenodd" d="M3 4H5V18H21V20H5H3V18V4ZM9 14H7V16H9V14ZM11 12V14H9V12H11ZM13 12V10H11V12H13ZM15 12H13V14H15V12ZM17 10H15V12H17V10ZM19 8V10H17V8H19ZM19 8V6H21V8H19Z" fill={color} />
  </svg>
)

export default CalcIcon
