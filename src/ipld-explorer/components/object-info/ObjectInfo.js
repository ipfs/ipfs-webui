/* eslint-disable space-before-function-paren */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import { withTranslation } from 'react-i18next'
import { ObjectInspector } from '@tableflip/react-inspector'
import filesize from 'filesize'
import LinksTable from './LinksTable'
const humansize = filesize.partial({ round: 0 })

const PurpleColor = '#8476BB'
const GrayWhite = 'rgba(255, 255, 255, 0.6)'

const objectInspectorTheme = {
  BASE_FONT_FAMILY: 'W95FA',
  BASE_FONT_SIZE: '14px',
  BASE_LINE_HEIGHT: '14px',

  BASE_BACKGROUND_COLOR: 'transparent',
  BASE_COLOR: GrayWhite,

  OBJECT_NAME_COLOR: PurpleColor,
  OBJECT_VALUE_NULL_COLOR: PurpleColor,
  OBJECT_VALUE_UNDEFINED_COLOR: PurpleColor,
  OBJECT_VALUE_REGEXP_COLOR: PurpleColor,
  OBJECT_VALUE_STRING_COLOR: PurpleColor,
  OBJECT_VALUE_SYMBOL_COLOR: PurpleColor,
  OBJECT_VALUE_NUMBER_COLOR: PurpleColor,
  OBJECT_VALUE_BOOLEAN_COLOR: PurpleColor,
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: PurpleColor,

  HTML_TAG_COLOR: PurpleColor,
  HTML_TAGNAME_COLOR: PurpleColor,
  HTML_TAGNAME_TEXT_TRANSFORM: 'lowercase',
  HTML_ATTRIBUTE_NAME_COLOR: PurpleColor,
  HTML_ATTRIBUTE_VALUE_COLOR: PurpleColor,
  HTML_COMMENT_COLOR: PurpleColor,
  HTML_DOCTYPE_COLOR: PurpleColor,

  ARROW_COLOR: '#6e6e6e',
  ARROW_MARGIN_RIGHT: 3,
  ARROW_FONT_SIZE: 12,

  TREENODE_FONT_FAMILY: 'W95FA',
  TREENODE_FONT_SIZE: '14px',
  TREENODE_LINE_HEIGHT: '14px',
  TREENODE_PADDING_LEFT: 12,

  TABLE_BORDER_COLOR: '#aaa',
  TABLE_TH_BACKGROUND_COLOR: '#eee',
  TABLE_TH_HOVER_COLOR: 'hsla(0, 0%, 90%, 1)',
  TABLE_SORT_ICON_COLOR: '#6e6e6e',
  TABLE_DATA_BACKGROUND_IMAGE: 'linear-gradient(to bottom, white, white 50%, rgb(234, 243, 255) 50%, rgb(234, 243, 255))',
  TABLE_DATA_BACKGROUND_SIZE: '128px 32px'
}

// TODO: Use https://github.com/multiformats/multicodec/blob/master/table.csv to get full name.
const nodeStyles = {
  'dag-cbor': { shortName: 'CBOR', name: 'dag-cbor', color: '#28CA9F' },
  'dag-pb': { shortName: 'PB', name: 'dag-pb', color: '#244e66' },
  'git-raw': { shortName: 'GIT', name: 'Git', color: '#378085' },
  'raw': { shortName: 'RAW', name: 'Raw Block', color: '#f14e32' }, // eslint-disable-line quote-props
  'eth-block': { shortName: 'ETH', name: 'Ethereum Block', color: '#383838' },
  'eth-block-list': { shortName: 'ETH', name: 'Ethereum Block List', color: '#383838' },
  'eth-tx-trie': { shortName: 'ETH', name: 'Ethereum Tx Trie', color: '#383838' },
  'eth-tx': { shortName: 'ETH', name: 'Ethereum Tx', color: '#383838' },
  'eth-state-trie': { shortName: 'ETH', name: 'Ethereum State Trie', color: '#383838' }
}

export function shortNameForNode(type) {
  const style = nodeStyles[type]
  return (style && style.shortName) || 'DAG'
}

export function nameForNode(type) {
  const style = nodeStyles[type]
  return (style && style.name) || 'DAG Node'
}

export function colorForNode(type) {
  const style = nodeStyles[type]
  return (style && style.color) || '#ea5037'
}

// '/a/b' => ['$', '$.a', '$.a.b']
// See: https://github.com/xyc/react-inspector#api
export function toExpandPathsNotation(localPath) {
  if (!localPath) return []
  const parts = localPath.split('/')
  const expandPaths = parts.map((part, i) => {
    if (!part) return '$'
    const relPath = parts.slice(0, i).join('.')
    return `$${relPath}.${part}`
  })
  return expandPaths.slice(0, expandPaths.length - 1)
}

const ObjectInfo = ({ t, tReady, hideTitle = false, className, type, cid, localPath, size, data, links, format, onLinkClick, gatewayUrl, ...props }) => {
  return (
    <section className={`ph3 pv3 spacegrotesk ${className}`} {...props}>
      {
        !hideTitle && <h2 className='ma0 lh-title f5 fw4 spacegrotesk white pb2' title={type}>
          <span className='v-mid'>
            {nameForNode(type)}
          </span>
          {format === 'unixfs' ? (
            <a className='dn di-ns link spacegrotesk ml2' href='https://docs.ipfs.io/concepts/file-systems/#unix-file-system-unixfs' target='_external'>UnixFS</a>
          ) : null}
          {format === 'unixfs' && data.type && ['directory', 'file'].some(x => x === data.type) ? (
            <a className='link w95fa ml2 pa2 fw5 f6 blue' href={`${gatewayUrl}/ipfs/${cid}`} target='_external'>
              {t('ObjectInfo.gatewayLink')}
            </a>
          ) : null}
        </h2>
      }

      <div className='f6'>
        {!cid ? null : (
          <div className='dt dt--fixed pt2'>
            <label className='dtc silver ttu f6' style={{ width: 70 }}>CID</label>
            <div className='dtc truncate white' data-id='ObjectInfo-cid'>{cid}</div>
          </div>
        )}
        {!size ? null : (
          <div className='dt dt--fixed pt2'>
            <label className='dtc silver ttu f6' style={{ width: 70 }}>Size</label>
            <div className='dtc truncate white'>{humansize(size)}</div>
          </div>
        )}
        <div className='dt dt--fixed pt2'>
          <label className='dtc silver ttu f6' style={{ width: 70 }}>Links</label>
          <div className='dtc truncate white'>
            {links ? (<code className='w95fa'>{links.length}</code>) : 'No Links'}
          </div>
        </div>
        <div className='dt dt--fixed pt2' style={{ height: 26 }}>
          <label className='dtc silver ttu f6 v-mid' style={{ width: 70 }}>Data</label>
          <div className='dtc truncate white'>
            {data ? null : 'No data'}
          </div>
        </div>
        {!data ? null : (
          <div className='pa3 mt2 f5 nl3 nr3' style={{ background: '#1d182c', borderTop: '1px solid #312F62', borderBottom: '1px solid #312F62' }}>
            <ObjectInspector showMaxKeys={100} data={data} theme={objectInspectorTheme} expandPaths={toExpandPathsNotation(localPath)} />
          </div>
        )}
      </div>
      {!links || !links.length ? null : (
        <div className='mv2 nl3 nr3 mh0-l'>
          <LinksTable links={links} onLinkClick={onLinkClick} />
        </div>
      )}
    </section>
  )
}

export default withTranslation('explore')(ObjectInfo)
