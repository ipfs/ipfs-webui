import React, {Component} from 'react'
import TabbedArea from 'react-bootstrap/lib/TabbedArea'
import TabPane from 'react-bootstrap/lib/TabPane'

class Swarmvis extends Component {
  render () {
    return (
      <div className='webui-swarm-vis'>
        <TabbedArea bsStyle='pills' defaultActiveKey={1} animation={false}>
          <TabPane key={1} tab='Swarm Map'>
            <div className='panel panel-default'>
              <img src='https://www.evernote.com/shard/s198/sh/b925cb75-3118-4f72-9357-9e2ccedbc982/96cf769f0373e76da8868f0499669405/deep/0/Google-Maps.png' />
            </div>
          </TabPane>
          <TabPane key={2} tab='Swarm Ring'>
            <div className='panel panel-default'>
              <img src='http://www.openmediaboston.org/sites/default/files/styles/large/public/bittorrent_swarm.png?itok=6ULLfBgn' />
            </div>
          </TabPane>
        </TabbedArea>
      </div>
    )
  }
}

Swarmvis.displayName = 'Swarmvis'

export default Swarmvis
