import React from 'react'
import { ObjectInspector } from 'react-inspector'
import filesize from 'filesize'
const humansize = filesize.partial({round: 0, unix: true})

const nodeStyles = {
  'dag-cbor': {name: 'CBOR DAG Node', color: '#28CA9F'},
  'dag-pb': {name: 'Protobuf Dag Node', color: '#244e66'}
}

function nameForNode (type) {
  const style = nodeStyles[type]
  return (style && style.name) || 'DAG Node'
}

function colorForNode (type) {
  const style = nodeStyles[type]
  return (style && style.color) || '#ea5037'
}

const DagNodeIcon = ({type, ...props}) => (
  <svg {...props} title={nameForNode(type)} width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='15' cy='15' r='15' fillRule='evenodd' fill={colorForNode(type)} />
  </svg>
)

class LinkRow extends React.Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  onClick () {
    const {onClick, link} = this.props
    onClick(link)
  }

  render () {
    const {index, link} = this.props
    const {name, size, multihash} = link
    return (
      <tr className='pointer striped--near-white' onClick={this.onClick} key={`${multihash}-${name}`}>
        <td className='pv1 ph2 silver truncate monospace tr f7'>
          {index}
        </td>
        <td className='pv1 ph2 dark-gray truncate navy-muted'>
          {name}
        </td>
        <td className='pv1 pr4 mid-gray truncate monospace tr f7' title={`${size} B`}>
          {size ? humansize(size) : null}
        </td>
        <td className='pv1 pr2 mid-gray monospace f7'>
          {multihash}
        </td>
      </tr>
    )
  }
}

const ObjectInfo = ({className, type, cid, size, data, links, onLinkClick, ...props}) => {
  return (
    <section className={`pa4 sans-serif ${className}`} {...props}>
      <h2 className='ma0 lh-title f4 fw4 pb2' title={type}>
        <DagNodeIcon type={type} className='v-mid mr3' />
        <span className='v-mid'>
          {nameForNode(type)}
        </span>
      </h2>
      <div className='f6'>
        {!cid ? null : (
          <div className='dt dt--fixed pt2'>
            {/* <label className='dtc' style={{width: 48}}>CID</label> */}
            <label className='dtc gray' style={{width: 48}}>CID</label>
            <div className='dtc truncate navy monospace'>{cid}</div>
          </div>
        )}
        {!size ? null : (
          <div className='dt dt--fixed pt2'>
            <label className='dtc gray' style={{width: 48}}>Size</label>
            <div className='dtc truncate mid-gray monospace'>{humansize(size)}</div>
          </div>
        )}
        <div className='dt dt--fixed pt2'>
          <label className='dtc gray' style={{width: 48}}>Data</label>
          {/* <label className='dtc' style={{width: 48}}>Data</label> */}
          { data ? null : (
            <div className='dtc mid-gray'>
              No data
            </div>
          )}
        </div>
        { !data ? null : (
          <div className='pa3 mt2 bg-white'>
            <ObjectInspector data={data} />
          </div>
        )}
        <div className='dt dt--fixed pt2'>
          <label className='dtc gray' style={{width: 48}}>Links</label>
          {/* <label className='dtc' style={{width: 48}}>Links</label> */}
          <div className='dtc mid-gray'>
            { links ? links.length : 'No Links' }
          </div>
        </div>
      </div>
      { !links || !links.length ? null : (
        <div className='bg-white mt2 overflow-auto'>
          <table className='lh-copy tl f6 w-100 dt--fixed' cellSpacing='0'>
            <thead>
              <tr>
                <th className='fw4 bb b--black-20 pv2 ph2' style={{width: '45px'}} />
                <th className='fw4 bb b--black-20 pv2 w-30 ph2' style={{width: '190px'}}>Name</th>
                <th className='fw4 bb b--black-20 pv2 pr4 tr' style={{width: '100px'}}>Size</th>
                <th className='fw4 bb b--black-20 pv2' >CID</th>
              </tr>
            </thead>
            <tbody className='fw4'>
              {links.map((link, i) => (
                <LinkRow link={link} index={i} onClick={onLinkClick} key={link.hash + '/' + link.name} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ObjectInfo
