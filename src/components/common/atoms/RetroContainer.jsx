/* eslint-disable space-before-function-paren */
import styled from 'styled-components'
import { getBoxShadowWithoutBorders } from './utils'

const StyledContainer = styled.div`
  /* Basic */
  background-color:${p => p.bgColor ? p.bgColor : ' rgba(255, 255, 255, 0.05)'};
  padding: ${p => 3 + p.padding}px;
  margin: ${p => p.margin}px;
  /* Size */
  width: ${p => p.width};
  min-width: ${p => p.minWidth};
  height: ${p => p.height};
  min-height: ${p => p.minHeight};
  mix-blend-mode: normal;
  /* Borders */
  border: ${p => p.border ? p.border : 'none'};
  /* box-shadow: ${p => p.inset ? getBoxShadowWithoutBorders(p.border, true, p.colors) : getBoxShadowWithoutBorders(p.border, false, p.colors)}; */
`

export default function RetroContainer({
  inset = false,
  width = '100%',
  minWidth = '0',
  height = '100%',
  minHeight = '0',
  border = 1,
  padding = 0,
  margin = 0,
  bgColor = '#fff2',
  colors = ['#464646', '#fff'],
  children,
  ...rest
}) {
  return (
    <StyledContainer
      inset={inset}
      width={width}
      bgColor={bgColor}
      minWidth={minWidth}
      height={height}
      minHeight={minHeight}
      border={border}
      padding={padding}
      margin={margin}
      colors={colors}
      {...rest}
    >
      {children}
    </StyledContainer>
  )
}
