import React from 'react'
import filesize from 'filesize'
const humansize = filesize.partial({round: 1})

const NodeInfo = ({className, type, cid, size, data, links, ...props}) => {
  return (
    <section className={`bg-light-gray pa3 sans-serif ${className}`}>
      <h2 className='ma0 lh-title pb3 f4 fw4'>{type}</h2>
      <div className='f6'>
        <div className='dt dt--fixed'>
          <label className='dtc w-10'>CID</label>
          <div className='dtc truncate mid-gray monospace'>{cid}</div>
        </div>
        <div className='dt dt--fixed pt2'>
          <label className='dtc w-10'>Size</label>
          <div className='dtc truncate mid-gray'>{humansize(size)}</div>
        </div>
        <div className='dt dt--fixed pt3'>
          <label className='dtc w-10'>Data</label>
          { data ? null : (
            <div className='dtc mid-gray'>
              No data
            </div>
          )}
        </div>
        { !data ? null : (
          <div className='bg-dark-gray white pa3 mt2'>
            <code>{data}</code>
          </div>
        )}
        <div className='dt dt--fixed pt3'>
          <label className='dtc w-10'>Links</label>
          { links ? null : (
            <div className='dtc mid-gray'>
              No Links
            </div>
          )}
        </div>
      </div>
      { !links ? null : (
        <div className='pb2 bg-near-white mt2'>
          <table className='dt--fixed lh-copy tl f6' cellspacing='0'>
            <thead>
              <tr>
                <th className='fw4 bb b--black-20 pv2 w-20 pl3'>Name</th>
                <th className='fw4 bb b--black-20 pv2 w-20'>Size</th>
                <th className='fw4 bb b--black-20 pv2'>CID</th>
              </tr>
            </thead>
            <tbody className='fw4'>
              {links.map(({name, size, multihash}) => (
                <tr className='hover-bg-white-30'>
                  <td className='pv1 pr2 pl3'>
                    <a className='link dark-gray truncate' href='#'>{name}</a>
                  </td>
                  <td className='pv1 pr2 mid-gray truncate w-20'>{humansize(size)}</td>
                  <td className='pv1 pr2 mid-gray truncate monospace'>{multihash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default NodeInfo
