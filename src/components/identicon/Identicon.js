import React from 'react'
import ReactIdenticon from 'react-identicons'
import { colors } from 'ipfs-css/theme.json'

const identiconPalette = [colors.navy, colors.aqua, colors.gray, colors.charcoal, colors.red, colors.yellow, colors.teal, colors.green]

const Identicon = ({ size = 14, cid, className = 'v-btm' }) => <ReactIdenticon string={cid} size={size} palette={identiconPalette} className={className} />

export default Identicon
