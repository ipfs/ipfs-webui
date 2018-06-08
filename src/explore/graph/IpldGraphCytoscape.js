import React from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import {colorForNode} from '../object-info/ObjectInfo'

cytoscape.use(dagre)

const layoutOpts = {
  name: 'dagre',
  rankSep: 80,
  nodeSep: 1
}

// the stylesheet for the graph
const styleOpts = [
  {
    selector: 'node',
    style: {
      shape: 'ellipse',
      width: '14px',
      height: '14px',
      'background-color': 'data(bg)'
    }
  },
  {
    selector: 'edge',
    style: {
      'source-distance-from-node': 3,
      'target-distance-from-node': 4,
      'curve-style': 'bezier',
      'control-point-weight': 0.5,
      'width': 1,
      'line-color': '#979797',
      'line-style': 'dotted',
      'target-label': 'data(index)',
      'font-family': 'Consolas, monaco, monospace',
      'font-size': '8px',
      'target-text-margin-x': '-5px',
      'color': '#ccc',
      'target-text-margin-y': '-2px',
      'text-halign': 'center',
      'text-valign': 'bottom'
    }
  }
]

export default class IpldGraphCytoscape extends React.Component {
  constructor (props) {
    super(props)
    this.graphRef = React.createRef()
    this.renderTree = this.renderTree.bind(this)
    this.ipfsLinksToCy = this.ipfsLinksToCy.bind(this)
    this.cy = null
  }

  componentDidMount () {
    const {path, links} = this.props
    const container = this.graphRef.current
    this.cy = this.renderTree({path, links, container})
  }

  componentDidUpdate () {
    this.cy.destroy()
    const {path, links} = this.props
    const container = this.graphRef.current
    this.cy = this.renderTree({path, links, container})
  }

  render () {
    // pluck out custom props. Pass anything else on
    const { onNodeClick, path, cid, ...props } = this.props
    return <div ref={this.graphRef} {...props} />
  }

  renderTree ({path, links, container}) {
    const cyLinks = this.ipfsLinksToCy(links)
    // TODO: path is currently alwasys the root cid, but this will change.
    const root = this.makeNode({target: path}, '')

    // list of graph elements to start with
    const elements = [
      root,
      ...cyLinks
    ]

    const cy = cytoscape({
      elements: elements,
      container: container,
      style: styleOpts,
      layout: layoutOpts,
      wheelSensitivity: 0.5
    })

    if (this.props.onNodeClick) {
      cy.on('tap', async (e) => {
        const data = e.target.data()
        // map back from cyNode to ipfs link
        this.props.onNodeClick({target: data.target, path: data.path})
      })
    }

    return cy
  }

  ipfsLinksToCy (links) {
    if (!links.length) return
    const edges = links.map(this.makeLink)
    const nodes = links.map(this.makeNode)
    return [...nodes, ...edges]
  }

  makeNode ({target, path}, index) {
    // TODO: pass link type info.
    const type = target.startsWith('Q') ? 'dag-pb' : 'dag-cbor'
    const bg = colorForNode(type)
    return {
      group: 'nodes',
      data: {
        id: target,
        path,
        bg,
        index
      }
    }
  }

  makeLink ({source, target, path}, index) {
    return {
      group: 'edges',
      data: {
        source,
        target,
        index
      }
    }
  }

  runLayout (cy) {
    cy.layout(this.layoutOpts).run()
  }
}
