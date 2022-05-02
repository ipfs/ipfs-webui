import styled from 'styled-components'
import { getBoxShadow, getBoxShadowWithoutBorders } from './utils'

const colors = ['#464646', '#ECECEC']

const StyledContainer = styled.div`
  /* Basic */
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  background-color: ${p => p.bg};
  padding: ${p => (p.padding + 2) * 3}px;
  /* Size */
  width: ${p => p.width};
  height: ${p => p.height};
  /* Fonts */
  font-family: 'SpaceGrotesk-Regular';
  font-size: ${p => p.fontSize}px;
  line-height: ${p => p.fontHeight}px;
  /* Borders */
  /* box-shadow: ${p => !p.withoutShadow ? getBoxShadow(p.border, true, colors) : getBoxShadowWithoutBorders(p.border, true, colors)}; */
  border: ${p => p.border || '1px solid #312F62'}  ;
  outline: none !important;
`

const StyledTextField = styled.input`
  /* Size */
  width: calc(100% - ${p => (p.padding + 2) * 3}px);
  height: 100%;
  background-color: ${p => p.bg};
  color: white;
  font-family: SpaceGrotesk-Regular;
  font-weight: 300;
  font-size: 12px;
  line-height: 140%;
  /* Borders */
  border: 1px dashed transparent;
  outline: none;
  /* States */
  &:focus {
    border: 1px dashed #000;
  }
`

const RetroInput = ({
  withoutShadow = false,
  value,
  width = '100%',
  height = '100%',
  border = '1px solid #312F62',
  bg = 'transparent',
  placeholderColor = 'gray',
  padding = 0,
  fontSize = 12,
  fontHeight = 16,
  placeholder = '',
  leftIcon,
  inputRef = null,
  onChange = () => { },
  onKeyDown = () => { },
  onKeyPress = () => { },
  name = '', id = '', type = '',
  rightButton,
  ...rest
}) => {
  return (
    <StyledContainer
      withoutShadow={withoutShadow}
      width={width}
      height={height}
      padding={padding}
      border={border}
      bg={bg}
      fontSize={fontSize}
      fontHeight={fontHeight}
      {...rest}
    >
      {leftIcon}
      <StyledTextField
        value={value}
        placeholder={placeholder}
        padding={padding}
        border={border}
        bg={bg}
        ref={inputRef}
        name={name}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyPress={onKeyPress}
        id={id}
        type={type}
      />
      {rightButton}
    </StyledContainer>
  )
}

export default RetroInput
