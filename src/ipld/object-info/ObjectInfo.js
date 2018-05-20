import React from 'react'
import filesize from 'filesize'
const humansize = filesize.partial({round: 0})

const ObjectInfo = ({className, type, cid, size, data, links, ...props}) => {
  return (
    <section className={`bg-light-gray pa4 sans-serif ${className}`} {...props}>
      <h2 className='ma0 lh-title pb3 f4 fw4'>
        {type}
      </h2>
      <div className='f6'>
        <div className='dt dt--fixed'>
          <label className='dtc' style={{width: 50}}>CID</label>
          <div className='dtc truncate mid-gray monospace'>{cid}</div>
        </div>
        <div className='dt dt--fixed pt2'>
          <label className='dtc' style={{width: 50}}>Size</label>
          <div className='dtc truncate mid-gray monospace'>{humansize(size)}</div>
        </div>
        <div className='dt dt--fixed pt3'>
          <label className='dtc' style={{width: 50}}>Data</label>
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
          <label className='dtc' style={{width: 50}}>Links</label>
          <div className='dtc mid-gray'>
            { links ? links.length : 'No Links' }
          </div>
        </div>
      </div>
      { !links ? null : (
        <div className='bg-near-white mt2 overflow-scroll'>
          <table className='lh-copy tl f6 w-100 dt--fixed' cellSpacing='0'>
            <thead>
              <tr>
                <th className='fw4 bb b--black-20 pv2 ph2' style={{width: '45px'}} />
                <th className='fw4 bb b--black-20 pv2 w-30 ph2' style={{width: '300px'}}>Name</th>
                <th className='fw4 bb b--black-20 pv2 pr4 tr' style={{width: '100px'}}>Size</th>
                <th className='fw4 bb b--black-20 pv2' >CID</th>
              </tr>
            </thead>
            <tbody className='fw4'>
              {links.map(({name, size, multihash}, i) => (
                <tr className='pointer striped--light-gray' key={`${multihash}-${name}`}>
                  <td className='pv1 ph2 silver truncate monospace tr f7' title='Link index'>
                    {i}
                  </td>
                  <td className='pv1 ph2 dark-gray truncate teal'>
                    {name}
                  </td>
                  <td className='pv1 pr4 mid-gray truncate monospace tr f7' title={`${size} B`}>
                    {humansize(size)}
                  </td>
                  <td className='pv1 pr2 mid-gray monospace f7'>
                    {multihash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ObjectInfo
