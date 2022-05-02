import React from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import { getCodecOrNull } from '../../lib/cid'
import { colorForNode } from '../object-info/ObjectInfo'

import NodeIcon from '../../../icons/retro/NodeIcon'

cytoscape.use(dagre)

const svgNodeUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(NodeIcon)

const graphOpts = {
  wheelSensitivity: 0.05,
  layout: {
    name: 'dagre',
    rankSep: 80,
    nodeSep: 20
  },
  style: [
    {
      selector: 'node',
      style: {
        shape: 'polygon',
        'shape-polygon-points':
          '-1 0.5 -0.75 0.5 -0.75 0.75 -0.5 0.75 -0.5 1 ' + //  bottom left
          '0.5 1 0.5 0.75 0.75 0.75 0.75 0.5 1 0.5 ' + // bottom right
          '1 -0.5 0.75 -0.5 0.75 -0.75 0.5 -0.75 0.5 -1 ' + //  top right
          '-0.5 -1 -0.5 -0.75 -0.75 -0.75 -0.75 -0.5 -1 -0.5', // top left
        width: '25px',
        height: '25px',
        'background-color': 'transparent',
        'background-image': svgNodeUrl
      }
    },
    {
      selector: 'edge',
      style: {
        'source-distance-from-node': 3,
        'target-distance-from-node': 10,
        'curve-style': 'bezier',
        'control-point-weight': 0.5,
        width: 1,
        'line-color': '#fff',
        'line-style': 'dotted',
        'target-label': 'data(index)',
        'font-family': 'W95FA',
        'font-size': '8px',
        // 'target-text-margin-x': '-5px',
        color: 'silver',
        'target-text-margin-y': '5px',
        'text-halign': 'left',
        'text-valign': 'center'
      }
    }
  ]
}

export default class IpldGraphCytoscape extends React.Component {
  constructor (props) {
    super(props)
    this.graphRef = React.createRef()
    this.renderTree = this.renderTree.bind(this)
    this.ipfsLinksToCy = this.ipfsLinksToCy.bind(this)
    this.cy = null
    this.state = {}
  }

  static getDerivedStateFromProps (props, state) {
    return {
      truncatedLinks: props.links.slice(0, 100)
    }
  }

  componentDidMount () {
    const { path } = this.props
    const { truncatedLinks: links } = this.state
    const container = this.graphRef.current
    this.cy = this.renderTree({ path, links, container })
  }

  componentDidUpdate () {
    this.cy.destroy()
    const { path } = this.props
    const { truncatedLinks: links } = this.state
    const container = this.graphRef.current
    this.cy = this.renderTree({ path, links, container })
  }

  render () {
    // pluck out custom props. Pass anything else on
    const { onNodeClick, path, cid, className, ...props } = this.props
    return <div className={className} ref={this.graphRef} {...props} />
  }

  renderTree ({ path, links, container }) {
    const cyLinks = this.ipfsLinksToCy(links)
    const root = this.makeNode({ target: path }, '')

    // list of graph elements to start with
    const elements = [
      root,
      ...cyLinks
    ]

    const cy = cytoscape({
      elements: elements,
      container: container,
      ...graphOpts
    })

    if (this.props.onNodeClick) {
      cy.on('tap', async (e) => {
        // onNodeClick is triggered when clicking in gaps between nodes which is weird
        if (!e.target.data) return
        const data = e.target.data()
        const link = this.state.truncatedLinks[data.index]
        this.props.onNodeClick(link)
      })
    }

    return cy
  }

  ipfsLinksToCy (links) {
    const edges = links.map(this.makeLink)
    const nodes = links.map(this.makeNode)
    return [...nodes, ...edges]
  }

  makeNode ({ target, path }, index) {
    const type = getCodecOrNull(target)
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

  makeLink ({ source, target, path }, index) {
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
