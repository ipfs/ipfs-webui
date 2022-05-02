/* eslint-disable space-before-function-paren */
import styled from 'styled-components'
// import { getBoxShadow } from './utils'

// const colors = ['#464646', '#fff']

const StyledButton = styled.button`
  /* Basic */
  /* background: #fff4;
  background-size: 100%; */
  position: relative;
  padding: 1px;
  margin: ${p => p.margin}px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'} !important;
  /* Size */
  width: ${p => p.width};
  min-width: ${p => p.minWidth};
  height: ${p => p.height};
  min-height: ${p => p.minHeight};
  border-radius: ${p => p.borderRadius};

  /* Borders */
  transition: all ease 0.3s;
  outline: none !important;
  &:before{
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: ${p => p.borderRadius};
    border: 3px solid transparent;
    background: #fff4;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    /* &:hover{
      background: linear-gradient(145.9deg, #FF7F69 5.46%, #FF2D83 30.27%, #6695FF 88.28%);
    } */
  }
  &:hover{
    &:before{
      background: linear-gradient(145.9deg, #FF7F69 5.46%, #FF2D83 30.27%, #6695FF 88.28%);
      background-size: 300%;
      background-position: center center;
    }
    /* background: linear-gradient(145.9deg, #FF7F69 5.46%, #FF2D83 30.27%, #6695FF 88.28%);
    background-size: 300%;
    background-position: right center; */
  }
  /* States */
  &:active {
    /* background: linear-gradient(145.9deg, #FF7F69 5.46%, #FF2D83 30.27%, #6695FF 88.28%); */
    /* background-color:#110D21aa */
  }
  &:focus div {

    /* background-color:#110D21aa */
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
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  margin: 1px;
  /* background: #110D21; */
  border-radius: ${p => p.borderRadius};
  color:white;
`

export default function RetroGradientButton({
  disabled = false,
  active = false,
  flat = false,
  borderRadius = '0px',
  backgroundColor = '#0000',
  activeBgColor = '#fff',
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
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
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
      <StyledContainer borderRadius={borderRadius}>
        {children}
      </StyledContainer>
    </StyledButton>

  )
}
