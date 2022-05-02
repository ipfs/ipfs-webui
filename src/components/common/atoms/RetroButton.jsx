/* eslint-disable space-before-function-paren */
import styled from 'styled-components'
import { getBoxShadow } from './utils'

const colors = ['#464646', '#fff']

const StyledButton = styled.button`
  /* Basic */
  background-color: ${p => p.isActive ? p.activeBgColor : p.backgroundColor};
  padding: ${p => 2 * 3 + p.padding}px;
  margin: ${p => p.margin}px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'} !important;
  /* Size */
  width: ${p => p.width};
  min-width: ${p => p.minWidth};
  height: ${p => p.height};
  min-height: ${p => p.minHeight};

  /* Borders */
  border: none;
  border-top: ${p => p.isActive || (p.border === 'none') ? 'none' : '1px solid #312F62'};
  border-bottom: ${p => p.isActive || (p.border === 'none') ? 'none' : '1px solid #312F62'};

  /* box-shadow: ${p => !p.flat ? getBoxShadow(p.border, p.isActive, colors) : 'none'}; */
  outline: none !important;
  /* States */
  &:active {
    background-color: ${p => p.activeBgColor}
  }
  &:focus div {
    background-color: ${p => p.focusBgColor}
    /* padding: 0;
    border: ${p => '1px dashed #1E1E1E'}; */
  }
`

const StyledContainer = styled.div`
  /* Basic */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px;
  width: 100%;
  height: 100%;
`

export default function RetroButton({
  disabled = false,
  active = false,
  flat = false,
  backgroundColor = '#0000',
  activeBgColor = '#fff',
  focusBgColor = '#0000',
  width = '100%',
  minWidth = '0',
  height = '100%',
  minHeight = '100%',
  border = 0,
  padding = 0,
  margin = 0,
  ariaLabel = '',
  onClick = () => { },
  buttonRef,
  children,
  ...rest
}) {
  return (
    <StyledButton
      disabled={disabled}
      ref={buttonRef}
      activeBgColor={activeBgColor}
      focusBgColor={focusBgColor}
      backgroundColor={backgroundColor}
      flat={flat}
      onClick={onClick}
      width={width}
      minWidth={minWidth}
      height={height}
      minHeight={minHeight}
      isActive={active}
      padding={padding}
      margin={margin}
      border={border}
      aria-label={ariaLabel}
      {...rest}>
      <StyledContainer>
        {children}
      </StyledContainer>
    </StyledButton>
  )
}
