import styled from 'styled-components'

const StyledText = styled.p`
  /* Basic */
  position: relative;
  top: ${p => p.top};
  margin: 0 5px;

  /* Fonts */
  color: ${p => p.isActive ? p.activeColor : p.color};
  font-family: ${p => p.fontFamily};
  font-size: ${p => p.fontSize}px;
  font-weight: 700;
  text-transform: ${p => p.textTransform};

`

export default function RetroText ({ color = '#000', fontFamily = 'SpaceGrotesk-Regular', activeColor = '#110D21', isActive, fontSize = 12, top = '1px', children, ...rest }) {
  return (
    <StyledText color={color} activeColor={activeColor} fontFamily={fontFamily} fontSize={fontSize} isActive={isActive} top={top} {...rest}>
      {children}
    </StyledText>
  )
}
