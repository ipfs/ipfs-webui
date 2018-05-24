import React from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import prettyHash from 'pretty-hash'
import {colorForNode} from '../object-info/ObjectInfo'

cytoscape.use(dagre)

const layoutOpts = {
  name: 'dagre',
  // animate: true,
  // animationDuration: 300,
  // animationEasing: 'ease-in-out-sine',
  rankSep: 80,
  nodeSep: 1
}
const styleOpts = [ // the stylesheet for the graph
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
      'control-point-weight': 1,
      'width': 1,
      'line-color': '#979797',
      'line-style': 'dotted',
      // 'target-label': 'data(prettyHash)',
      'font-family': 'monospace',
      'font-size': '8px',
      'text-rotation': '90deg',
      // 'target-text-margin-x': '0px',
      'target-text-margin-y': '45px',
      'text-halign': 'left',
      'text-valign': 'bottom',
      'color': '#243a53'
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
    const root = this.makeNode({multihash: path})

    const elements = [ // list of graph elements to start with
      root,
      ...cyLinks
    ]

    const cy = cytoscape({
      elements: elements,
      container: container,
      style: styleOpts,
      layout: layoutOpts,
      wheelSensitivity: 0.5
      // autolock: true // nope. breaks everything.
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
    const showLinks = links // .slice(0, 6)
    const edges = showLinks.map(this.makeLink.bind(this, parent))
    const nodes = showLinks.map(this.makeNode)
    return [...nodes, ...edges]
  }

  makeNode ({multihash, size, name}) {
    const type = multihash.startsWith('Q') ? 'dag-pb' : 'dag-cbor' // TODO: pass link type info.
    const bg = colorForNode(type)
    return {
      group: 'nodes',
      data: {
        id: multihash,
        prettyHash: prettyHash(multihash),
        bg,
        size,
        name
      }
    }
  }

  makeLink (parent, link) {
    console.log('makeLink', {parent, link})
    const {multihash} = link
    return {
      group: 'edges',
      data: {
        prettyHash: prettyHash(multihash),
        source: parent,
        target: multihash
      }
    }
  }

  runLayout (cy) {
    cy.layout(this.layoutOpts).run()
  }
}
