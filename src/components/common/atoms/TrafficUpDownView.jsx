/* eslint-disable space-before-function-paren */
import styled from 'styled-components'
import { getBoxShadowWithoutBorders } from './utils'
import GreenUpIcon from '../.././../icons/retro/files/green-up-icon.png'
import GreenUpGraphIcon from '../.././../icons/retro/files/green-graph-icon.png'
import RedDownIcon from '../.././../icons/retro/files/red-down-icon.png'
import RedDownGraphIcon from '../.././../icons/retro/files/red-graph-icon.png'

const StyledContainer = styled.div`
  /* Basic */
  display: flex;
  flex-direction: row;
  padding: ${p => 3 + p.padding}px;
  margin: ${p => p.margin}px;
  /* Size */
  width: ${p => p.width};
  min-width: ${p => p.minWidth};
  height: ${p => p.height};
  min-height: ${p => p.minHeight};
  mix-blend-mode: normal;
  /* Borders */
  border: none;
  /* box-shadow: ${p => p.inset ? getBoxShadowWithoutBorders(p.border, true, p.colors) : getBoxShadowWithoutBorders(p.border, false, p.colors)}; */
`

const StyledText = styled.div`
  color: ${p => p.color};
  font-weight: 400;
  font-size: 11px;
  line-height: 14px;
  margin-left: 10px;
`

export default function TrafficUpDownView({
  inset = false,
  growRate = 0,
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
      {growRate > 0 && <>
        <img src={GreenUpGraphIcon} alt='green' />
        <img src={GreenUpIcon} width={6} height={6} style={{ marginTop: 6, marginLeft: 8 }} alt='green' />
        <StyledText color='#BDFF69' >
          +{growRate}%
        </StyledText>
      </>}
      {growRate < 0 && <>
        <img src={RedDownGraphIcon} alt='red' />
        <img src={RedDownIcon} width={6} height={6} style={{ marginTop: 6, marginLeft: 8 }} alt='red' />
        <StyledText color='#FA5050'>
          -{growRate}%
        </StyledText>
      </>}
    </StyledContainer>
  )
}
