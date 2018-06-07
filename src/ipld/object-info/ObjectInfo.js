import React from 'react'
import { ObjectInspector, chromeLight } from 'react-inspector'
import filesize from 'filesize'
const humansize = filesize.partial({round: 0})

const objectInspectorTheme = {
  ...chromeLight,
  BASE_FONT_SIZE: '13px',
  BASE_LINE_HEIGHT: '19px',
  TREENODE_FONT_SIZE: '13px',
  TREENODE_LINE_HEIGHT: '19px'
}

const nodeStyles = {
  'dag-cbor': {name: 'CBOR DAG Node', color: '#28CA9F'},
  'dag-pb': {name: 'Protobuf Dag Node', color: '#244e66'}
}

export function nameForNode (type) {
  const style = nodeStyles[type]
  return (style && style.name) || 'DAG Node'
}

export function colorForNode (type) {
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
        <DagNodeIcon type={type} className='mr3' style={{verticalAlign: -8}} />
        <span className='v-mid'>
          {nameForNode(type)}
        </span>
      </h2>
      <div className='f6'>
        {!cid ? null : (
          <div className='dt dt--fixed pt2'>
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
          { data ? null : (
            <div className='dtc mid-gray'>
              No data
            </div>
          )}
        </div>
        { !data ? null : (
          <div className='pa3 mt2 bg-white f5'>
            <ObjectInspector data={data} theme={objectInspectorTheme} />
          </div>
        )}
        <div className='dt dt--fixed pt2'>
          <label className='dtc gray' style={{width: 48}}>Links</label>
          <div className='dtc mid-gray'>
            { links ? (<code>{links.length}</code>) : 'No Links' }
          </div>
        </div>
      </div>
      { !links || !links.length ? null : (
        <div className='bg-white mt2' style={{overflowX: 'hidden', overflowY: 'auto'}}>
          <table className='lh-copy tl f6 w-100 dt--fixed' cellSpacing='0'>
            <thead>
              <tr>
                <th className='mid-gray fw4 bb b--black-10 pv2 ph2' style={{width: '45px'}} />
                <th className='mid-gray fw4 bb b--black-10 pv2 w-30 ph2' style={{width: '190px'}}>Name</th>
                <th className='mid-gray fw4 bb b--black-10 pv2 pr4 tr' style={{width: '100px'}}>Size</th>
                <th className='mid-gray fw4 bb b--black-10 pv2' >CID</th>
              </tr>
            </thead>
            <tbody className='fw4'>
              {links.map((link, i) => (
                <LinkRow link={link} index={i} onClick={onLinkClick} key={link.multihash + '/' + link.name} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ObjectInfo
