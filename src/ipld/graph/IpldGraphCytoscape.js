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
    return <div ref={this.graphRef} {...this.props} />
  }

  renderTree ({path, links, container}) {
    const cyLinks = this.ipfsLinksToCy(path, links)
    const root = this.makeNode({multihash: path}, '')

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
        this.props.onNodeClick({name: data.name, multihash: data.id})
      })
    }

    return cy
  }

  ipfsLinksToCy (parent, links) {
    if (!links.length) return
    const edges = links.map(this.makeLink.bind(this, parent))
    const nodes = links.map(this.makeNode)
    return [...nodes, ...edges]
  }

  makeNode ({multihash, size, name}, index) {
    // TODO: pass link type info.
    const type = multihash.startsWith('Q') ? 'dag-pb' : 'dag-cbor'
    const bg = colorForNode(type)
    return {
      group: 'nodes',
      data: {
        id: multihash,
        bg,
        size,
        name,
        index
      }
    }
  }

  makeLink (parent, link, index) {
    const {multihash} = link
    return {
      group: 'edges',
      data: {
        source: parent,
        target: multihash,
        index
      }
    }
  }

  runLayout (cy) {
    cy.layout(this.layoutOpts).run()
  }
}
