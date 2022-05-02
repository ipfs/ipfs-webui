import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../i18n-decorator'
import CidInfo from './CidInfo'

storiesOf('CID Info', module)
  .addDecorator(i18n)
  .add('cid v0 dag-pb', () => (
    <CidInfo className='ma2' cid='QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW' />
  ))
  .add('cid v1 b32 raw', () => (
    <CidInfo className='ma2' cid='zb2rhZMC2PFynWT7oBj7e6BpDpzge367etSQi6ZUA81EVVCxG' />
  ))
  .add('cid v1 b32 dag-pb', () => (
    <CidInfo className='ma2' cid='bafybeihj5nwgbaan7eh4ryrx5vjsi3zzn2dvpgv2ibvku6lwublilhxcfu' />
  ))
  .add('cid v1 b36 peerid', () => (
    <CidInfo className='ma2' cid='k51qzi5uqu5dghizkp74wj83c9r36bqd8aq0pozpifb8bmkzrtlud8i7tralyo' />
  ))
  // echo "ooh la la" | ipfs add --hash sha3
  .add('cid v1 b58 sha3', () => (
    <CidInfo className='ma2' cid='zB7NbGN5wyfSbNNNwo3smZczHZutiWERdvWuMcHXTj393RnbhwsHjrP7bPDRPA79YWPbS69cZLWXSANcwUMmk4Rp3hP9Y' />
  ))
  // echo "ooh la la" | ipfs add --hash blake2b-512
  .add('cid v1 b58 blake2b-512', () => (
    <CidInfo className='ma2' cid='z4QM3CM1XM3U62Yf7KNUzBpMPrjTAdeKJnp75JNkRQGeYk15w1hFt2z4ayjP33dBwuqsGz54hH47FMKi7LQ6iRNh8i2gUKDt' />
  ))
  .add('cid error', () => (
    <CidInfo className='ma2' cid='🚀' />
  ))
  .add('no cid', () => (
    <CidInfo />
  ))
