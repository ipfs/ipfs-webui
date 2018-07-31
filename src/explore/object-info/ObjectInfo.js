import React from 'react'
import { ObjectInspector, chromeLight } from '@tableflip/react-inspector'
import filesize from 'filesize'
import LinksTable from './LinksTable'
const humansize = filesize.partial({round: 0})

const objectInspectorTheme = {
  ...chromeLight,
  BASE_FONT_SIZE: '13px',
  BASE_LINE_HEIGHT: '19px',
  TREENODE_FONT_SIZE: '13px',
  TREENODE_LINE_HEIGHT: '19px'
}

// TODO: Use https://github.com/multiformats/multicodec/blob/master/table.csv to get full name.
const nodeStyles = {
  'dag-cbor': {shortName: 'CBOR', name: 'CBOR DAG Node', color: '#28CA9F'},
  'dag-pb': {shortName: 'PB', name: 'Protobuf DAG Node', color: '#244e66'},
  'git-raw': {shortName: 'GIT', name: 'Git', color: '#f14e32'},
  'eth-block': {shortName: 'ETH', name: 'Ethereum Block', color: '#383838'},
  'eth-block-list': {shortName: 'ETH', name: 'Ethereum Block List', color: '#383838'},
  'eth-tx-trie': {shortName: 'ETH', name: 'Ethereum Tx Trie', color: '#383838'},
  'eth-tx': {shortName: 'ETH', name: 'Ethereum Tx', color: '#383838'},
  'eth-state-trie': {shortName: 'ETH', name: 'Ethereum State Trie', color: '#383838'}
}

export function shortNameForNode (type) {
  const style = nodeStyles[type]
  return (style && style.shortName) || 'DAG'
}

export function nameForNode (type) {
  const style = nodeStyles[type]
  return (style && style.name) || 'DAG Node'
}

export function colorForNode (type) {
  const style = nodeStyles[type]
  return (style && style.color) || '#ea5037'
}

// '/a/b' => ['$', '$.a', '$.a.b']
// See: https://github.com/xyc/react-inspector#api
export function toExpandPathsNotation (localPath) {
  if (!localPath) return []
  const parts = localPath.split('/')
  const expandPaths = parts.map((part, i) => {
    if (!part) return '$'
    const relPath = parts.slice(0, i).join('.')
    return `$${relPath}.${part}`
  })
  return expandPaths.slice(0, expandPaths.length - 1)
}

const DagNodeIcon = ({type, ...props}) => (
  <svg {...props} title={nameForNode(type)} width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='15' cy='15' r='15' fillRule='evenodd' fill={colorForNode(type)} />
  </svg>
)

const ObjectInfo = ({className, type, cid, localPath, size, data, links, onLinkClick, ...props}) => {
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
            <label className='dtc silver tracked ttu f7' style={{width: 48}}>CID</label>
            <div className='dtc truncate navy monospace'>{cid}</div>
          </div>
        )}
        {!size ? null : (
          <div className='dt dt--fixed pt2'>
            <label className='dtc silver tracked ttu f7' style={{width: 48}}>Size</label>
            <div className='dtc truncate charcoal monospace'>{humansize(size)}</div>
          </div>
        )}
        <div className='dt dt--fixed pt2'>
          <label className='dtc silver tracked ttu f7' style={{width: 48}}>Links</label>
          <div className='dtc truncate charcoal'>
            { links ? (<code>{links.length}</code>) : 'No Links' }
          </div>
        </div>
        <div className='dt dt--fixed pt2' style={{height: 26}}>
          <label className='dtc silver tracked ttu f7 v-mid' style={{width: 48}}>Data</label>
          <div className='dtc truncate mid-gray'>
            { data ? null : 'No data'}
          </div>
        </div>
        { !data ? null : (
          <div className='pa3 mt2 bg-white f5'>
            <ObjectInspector showMaxKeys={20} data={data} theme={objectInspectorTheme} expandPaths={toExpandPathsNotation(localPath)} />
          </div>
        )}
      </div>
      { !links || !links.length ? null : (
        <div className='mt2' style={{height: 370}}>
          <LinksTable links={links} onLinkClick={onLinkClick} />
        </div>
      )}
    </section>
  )
}

export default ObjectInfo
