/* eslint-disable space-before-function-paren */
import styled from 'styled-components'

const StyledContainer = styled.div`
  width: ${p => p.width ? p.width : (p.vertical && '0')};
  height: ${p => p.height ? p.height : (!p.vertical && '0')};
  border: 1px solid;
  border-top-color: ${p => p.colors[p.inset !== (p.side === 't') ? 0 : 1]};
  border-bottom-color: ${p => p.colors[p.inset !== (p.side === 'b') ? 0 : 1]};
  border-left-color: ${p => p.colors[p.inset !== (p.side === 'l') ? 0 : 1]};
  border-right-color: ${p => p.colors[p.inset !== (p.side === 'r') ? 0 : 1]};
  margin: ${p => p.margin ? p.margin : 'none'};
`

export default function RetroSeparator({
  inset = false,
  vertical = false,
  side = 'b',
  colors = ['#939393', '#FFFFFF'],
  ...rest
}) {
  if (!['t', 'b', 'l', 'r'].includes(side)) side = 'b'

  return (
    <StyledContainer
      inset={inset}
      vertical={vertical}
      side={side}
      colors={colors}
      {...rest}
    />
  )
}
