/* eslint-disable space-before-function-paren */
import styled from 'styled-components'
// import { getBoxShadow } from './utils'

// const colors = ['#464646', '#fff']
const BlueBorderButton = styled.button`
  width: ${p => p.width ? p.width : '116px'};
  height: ${p => p.height ? p.height : '38px'};
  color: ${p => p.color ? p.color : 'white'};
  /* gradient */
  background: #0000;
  /* button style */
  background-size: 100%;
  background-position: center center;
  border: 1px solid #8588db;
  /* button style */
  transition: all 0.3s ease;
  &:hover{
    /* background-size: 300%; */
    /* background-position: right center; */
    box-shadow: 0px 2px 10px #8588db, inset 0px 6px 6px rgba(255, 255, 255, 0.6);
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

export default BlueBorderButton
