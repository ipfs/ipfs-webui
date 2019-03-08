import React from 'react'

export const statusTour = {
  steps: [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Status page</h2>
        <p className='tl f6'>This is the starting point of your IPFS node and where you can check its basic info.</p>
        <p className='tl f6'>Continue to learn more.</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Node info</h2>
        <p className='tl f6'>Here you have information about the size of your repo, how many peers are connected,
          your peer ID and the IPFS flavour that's currently in use.
        </p>
        <p className='tl f6'>Click on <code>Advanced</code> to see more info such as the gateway URL and addresses.</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-status-node'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Network bandwith</h2>
        <p className='tl f6'>This chart shows the network bandwith usage over time.</p>
      </div>,
      placement: 'top',
      target: '.joyride-status-bandwith'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Network traffic</h2>
        <p className='tl f6'>The speedometers show the current outgoing and incoming traffic.</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'left',
      target: '.joyride-status-traffic'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#69c4cd',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const filesTour = {
  steps: [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Files page</h2>
        <p className='tl f6'>
          This is where the files on your <a className='aqua link' href='https://docs.ipfs.io/guides/concepts/mfs/' rel='noopener noreferrer' target='_blank'>
          Mutable File System (MFS)</a> live. You can add files or folders and manage them from this page.
        </p>
        <p className='tl f6'>Continue to learn more.</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Breadcrumbs</h2>
        <p className='tl f6'>The current work directory, you can navigate through the folder hierarchy by clicking on them.</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-breadcrumbs'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>New folder</h2>
        <p className='tl f6'>Creates an empty folder in the current directory.</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-folder'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Add files</h2>
        <p className='tl f6'>
          You can add files or folders to your repo through this dropdown. If you want to add something that is
          already on IPFS, you can import it to your MFS by passing its <a className='aqua link' href='https://docs.ipfs.io/guides/concepts/cid/' rel='noopener noreferrer' target='_blank'>Content
          Identifier (CID)</a>.
        </p>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-add'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Files list</h2>
        <p className='tl f6'>Finally, the listing where you can find your files and folders.
        Drag and drop files or folders to add them.
        </p>
        <p className='tl f6'>You can share or download files, inspect them in the IPLD Explorer, rename or delete them!</p>
        <p className='mt4 tl f7'>Pro tip: drag and drop a file from any other page of the Web UI to
        add them to the root of your MFS.</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'center',
      target: 'body'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#69c4cd',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const peersTour = {
  steps: [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Peers page</h2>
        <p className='tl f6'>This is where you can see the peers that you are connected to and the country they are in.</p>
        <p className='tl f6'>Continue to learn more.</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Peers map</h2>
        <p className='tl f6'>A visualization of where the peers that you are connected to are in the world.</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-peers-map'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Peers table</h2>
        <p className='tl f6'>Check the IDs of the connected peers, their address and approximate location.</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'top',
      target: '.joyride-peers-table'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#69c4cd',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const settingsTour = {
  steps: [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Settings page</h2>
        <p className='tl f6'>This is where you can see the peers that you are connected to and the country they are in.</p>
        <p className='tl f6'>Continue to learn more.</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Language selector</h2>
        <p className='tl f6'>A visualization of where the peers that you are connected to are in the world.</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-settings-language'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Anonymous usage analytics</h2>
        <p className='tl f6'>Check the IDs of the connected peers, their address and approximate location.</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'top',
      target: '.joyride-settings-analytics'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#69c4cd',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}
