import React from 'react'
import { decodeCid } from '../../lib/cid'

const CidInfo = ({cid, className, ...props}) => {
  let cidErr = null
  let cidInfo = null
  try {
    cidInfo = cid ? decodeCid(cid) : null
  } catch (err) {
    cidErr = err
  }
  const hashFn = cidInfo.multihash.name
  const hashFnCode = cidInfo.multihash.code.toString('16')
  const hashLengthCode = cidInfo.multihash.length.toString('16')
  const hashLengthInBits = cidInfo.multihash.length * 8
  const hashValue = cidInfo.multihash.digest.toString('hex')
  const hashValueIn32CharChunks = hashValue.split('').reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 32)
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }
    resultArray[chunkIndex].push(item)
    return resultArray
  }, [])
  return !cid ? null : (
    <section className={`bg-light-gray pa3 sans-serif ${className}`}>
      <label className='db'>
        <a className='tracked ttu f6 fw2 teal-muted hover-aqua link' href='https://github.com/ipld/cid#human-readable-cids'>
          Human readable CID
        </a>
      </label>
      {!cidInfo ? null : (
        <div>
          <div className='f5 sans-serif fw5 ma0 pv2 dib overflow-x-auto w-100 truncate'>
            {`${cidInfo.multibase.name} - cidv${cidInfo.cid.version} - ${cidInfo.cid.codec} - ${cidInfo.multihash.name}-${cidInfo.multihash.length * 8}-${cidInfo.multihash.digest.toString('hex')}`}
          </div>
          <div className='fw2 ma0 gray ttu f7 tracked'>base - ver -  codec - multihash</div>
          <a
            href='https://github.com/multiformats/multihash#visual-examples'
            className='dib tracked ttu f6 fw2 teal-muted hover-aqua link pt4'>
            multihash
          </a>
          <div>
            <div className='dib monospace f6 pt2 tr dark-gray lh-title ph2'>
              <code className='gray'>0x</code>
              <span className='orange'>{hashFnCode}</span>
              <span className='green'>{hashLengthCode}</span>
              {hashValueIn32CharChunks.map(chunk => (
                <span>{chunk.join('')}<br /></span>
              ))}
              <div className='tl lh-copy'>
                <a className='db link orange pt2' href='https://github.com/multiformats/multihash/blob/master/hashtable.csv'>
                  <code className='gray'>0x</code>
                  <code>{hashFnCode}</code> = {hashFn}
                </a>
                <div className='green'>
                  <code className='gray'>0x</code>
                  <code>{hashLengthCode}</code> = {hashLengthInBits} bits</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!cidErr ? null : (
        <div>
          <div className='f5 sans-serif fw5 ma0 pv2 dib overflow-x-auto w-100 truncate'>
            {cid}
          </div>
          <div className='red fw2 ma0 f7'>{cidErr.message}</div>
        </div>
      )}
    </section>
  )
}

export default CidInfo
