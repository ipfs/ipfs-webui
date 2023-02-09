import React from 'react'
import ReactIdenticon from 'react-identicons'
import theme from 'ipfs-css/theme.json'

const { colors } = theme
const identiconPalette = [colors.navy, colors.aqua, colors.gray, colors.charcoal, colors.red, colors.yellow, colors.teal, colors.green]

export const Identicon = ({ size = 14, cid, className = 'v-btm' }) => <ReactIdenticon string={cid} size={size} palette={identiconPalette} className={className} />

export default Identicon
