/* eslint-disable space-before-function-paren */
import styled from 'styled-components'
// import { getBoxShadow } from './utils'

// const colors = ['#464646', '#fff']
const FullGradientButton = styled.button`
  width: ${p => p.width ? p.width : '116px'};
  height: ${p => p.height ? p.height : '38px'};
  color: ${p => p.color ? p.color : 'white'};
  /* gradient */
  background: linear-gradient(145.9deg, #FF7F69 5.46%, #FF2D83 30.27%, #6695FF 88.28%);
  background-size: 100%;
  background-position: center center;
  /* button style */
  box-shadow: 0px 12px 60px rgba(0, 0, 0, 0.5), inset 0px 6px 6px rgba(255, 255, 255, 0.44);
  transition: all 0.3s ease;
  &:hover{
    background-size: 300%;
    background-position: right center;
  }
  &:active{
    background-size: 300%;
    background-position: right center;
  }
  &:focus{
    background-size: 300%;
    background-position: right center;
  }

`

export default FullGradientButton
