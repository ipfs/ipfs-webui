import React from 'react'
import { decodeCid } from './decode-cid'
import { withTranslation } from 'react-i18next'

function extractInfo (cid) {
  const cidInfo = decodeCid(cid)
  const hashFn = cidInfo.multihash.name
  const hashFnCode = cidInfo.multihash.code.toString('16')
  const hashLengthCode = cidInfo.multihash.length.toString('16')
  const hashLengthInBits = cidInfo.multihash.length * 8
  const hashValue = toHex(cidInfo.multihash.digest)
  const hashValueIn32CharChunks = hashValue.split('').reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 32)
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }
    resultArray[chunkIndex].push(item)
    return resultArray
  }, [])
  const humanReadable = `${cidInfo.multibase.name} - cidv${cidInfo.cid.version} - ${cidInfo.cid.codec} - ${hashFn}~${hashLengthInBits}~${hashValue})`
  return {
    hashFn,
    hashFnCode,
    hashLengthCode,
    hashLengthInBits,
    hashValue,
    hashValueIn32CharChunks,
    humanReadable
  }
}

const toHex = (bytes) => Array.prototype.map.call(bytes, x => x.toString(16).padStart(2, '0')).join('').toUpperCase()

export const CidInfo = ({ t, tReady, cid, className, ...props }) => {
  let cidErr = null
  let cidInfo = null
  try {
    cidInfo = cid ? extractInfo(cid) : null
  } catch (err) {
    cidErr = err
  }
  return !cid ? null : (
    <section className={`ph3 pv4 w95fa ${className}`} {...props}>
      <label className='db pb2'>
        <a className='tracked ttu f5 fw2 pixm white no-underline' href='https://docs.ipfs.io/guides/concepts/cid/'>
          {t('CidInfo.header')}
        </a>
      </label>
      {!cidInfo ? null : (
        <div>
          <div className='f7 w95fa fw4 ma0 pb2 truncate gray'>
            {cid}
          </div>
          <div className='f6 w95fa white fw4 ma0 pb2 word-wrap' id='CidInfo-human-readable-cid'>
            {cidInfo.humanReadable}
          </div>
          <label htmlFor='CidInfo-human-readable-cid' className='db fw2 ma0 gray ttu f7 tracked'>
            {t('base')} - {t('version')} - {t('codec')} - {t('multihash')}
          </label>
          <a
            href='https://github.com/multiformats/multihash#visual-examples'
            className='dib tracked ttu f6 fw2 pixm white no-underline mt4'
          >
            {t('multihash')}
          </a>
          <div>
            <div className='dib w95fa f6 pt2 tr white lh-title ph2'>
              <code className='w95fa'>0x</code>
              <span style={{ color: '#E55555' }} >{cidInfo.hashFnCode}</span>
              <span style={{ color: '#45AF3C' }} >{cidInfo.hashLengthCode}</span>
              <span id='CidInfo-multihash'>
                {cidInfo.hashValueIn32CharChunks.map(chunk => (
                  <span className='w95fa' key={chunk.join('')}>{chunk.join('')}<br /></span>
                ))}
              </span>
              <label htmlFor='CidInfo-multihash' className='w95fa fw2 ma0 gray ttu f7 tracked'>
                {t('CidInfo.hashDigest')}
              </label>
              <div className='tl lh-copy'>
                <a className='db no-underline pt2' style={{ color: '#E55555' }} href='https://github.com/multiformats/multicodec/blob/master/table.csv'>
                  <code className='w95fa gray'>0x</code>
                  <code className='w95fa'>{cidInfo.hashFnCode}</code> = {cidInfo.hashFn}
                </a>
                <div id='CidInfo-multihash' style={{ color: '#45AF3C' }}>
                  <code className='w95fa gray'>0x</code>
                  <code className='w95fa'>{cidInfo.hashLengthCode}</code> = {cidInfo.hashLengthInBits} bits
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!cidErr ? null : (
        <div>
          <div className='f5 sans-serif fw5 ma0 pv2 truncate navy'>
            {cid}
          </div>
          <div className='red fw2 ma0 f7'>{cidErr.message}</div>
        </div>
      )}
    </section>
  )
}

export default withTranslation('explore')(CidInfo)
