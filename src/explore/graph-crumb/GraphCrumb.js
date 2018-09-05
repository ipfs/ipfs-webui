import React from 'react'
import Cid from '../../components/cid/Cid'
import { colorForNode } from '../object-info/ObjectInfo'

const GraphCrumb = ({ cid, pathBoundaries, localPath, hrefBase = '#/explore', ...props }) => {
  const [first, ...rest] = pathBoundaries
  const last = pathBoundaries[pathBoundaries.length - 1]
  const firstHrefBase = calculateHrefBase(hrefBase, cid, pathBoundaries, 0)
  return (
    <div {...props}>
      <div className='sans-serif'>
        <NodeUnderline cid={cid}>
          <a href={firstHrefBase} className='monospace link dark-gray o-50 glow'>
            <Cid value={cid} />
          </a>
          {first ? (
            <div className='dib'>
              <Divider />
              <Path path={first.path} hrefBase={firstHrefBase} sourceCid={cid} />
            </div>
          ) : null }
          {localPath && pathBoundaries.length === 0 ? (
            <div className='dib'>
              <Divider />
              <Path path={localPath} sourceCid={cid} hrefBase={firstHrefBase} />
            </div>
          ) : null}
        </NodeUnderline>
        {rest.map((link, i) => {
          const nextHrefBase = calculateHrefBase(hrefBase, cid, pathBoundaries, i + 1)
          return (
            <div className='dib' key={i}>
              <Divider />
              <NodeUnderline cid={link.source}>
                <Path
                  path={link.path}
                  sourceCid={link.source}
                  hrefBase={nextHrefBase} />
              </NodeUnderline>
            </div>
          )
        })}
        {localPath && pathBoundaries.length > 0 ? (
          <div className='dib'>
            <Divider />
            <NodeUnderline cid={last.target}>
              <Path
                path={localPath}
                sourceCid={last.target}
                hrefBase={calculateHrefBase(hrefBase, cid, pathBoundaries, pathBoundaries.length)} />
            </NodeUnderline>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function calculateHrefBase (hrefBase, cid, boundaries, boundaryIndex) {
  const relPath = boundaries.slice(0, boundaryIndex).map(b => b.path).join('/')
  const cidHref = hrefBase + '/' + cid
  return relPath ? cidHref + '/' + relPath : cidHref
}

const NodeUnderline = ({ cid, children }) => {
  // TODO: pass in or calc type
  const type = cid.startsWith('Qm') ? 'dag-pb' : 'dag-cbor'
  const color = colorForNode(type)
  return (
    <div className='dib overflow-hidden'>
      <div className='bb bw1 pb1' style={{ borderColor: color }}>{children}</div>
    </div>
  )
}

const Path = ({ path, hrefBase, sourceCid }) => {
  const parts = path.split('/').filter(p => !!p)
  return (
    <div className='dib'>
      {parts.map((p, i) => {
        const relPath = parts.slice(0, i + 1).join('/')
        const href = `${hrefBase}/${relPath}`
        return (
          <div className='dib' key={href}>
            {i !== 0 && <Divider />}
            <a
              className='dib link dark-gray o-50 glow'
              title={sourceCid + '/' + relPath}
              href={href}>
              {p}
            </a>
          </div>
        )
      })}
    </div>
  )
}

const Divider = () => <div className='dib ph2 gray v-top'>/</div>

export default GraphCrumb
