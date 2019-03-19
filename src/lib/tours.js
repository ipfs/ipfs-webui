import React from 'react'

export const appTour = {
  steps: [{
    content: <div className='montserrat white'>
      <p className='ma0 pa0 tl f6'>Click this button any time for a guided tour on the current page.</p>
    </div>,
    placement: 'left',
    target: '.joyride-app-tour',
    disableBeacon: true
  }],
  styles: {
    tooltipContent: { padding: '0 20px 0 0' },
    tooltipFooter: { display: 'none' },
    options: {
      width: '250px',
      backgroundColor: 'rgba(105, 196, 205, 0.85)',
      arrowColor: 'rgba(105, 196, 205, 0.85)',
      textColor: '#fff',
      zIndex: 999
    }
  }
}

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
        <h2 className='f3 fw4'>Connection status</h2>
        <p className='tl f6'>This takes you to a page where you can check if you are connected to an IPFS daemon, and if not, how to connect to one.</p>
        <p className='tl f6'>You can configure your node to with a custom API address too.</p>
      </div>,
      placement: 'left',
      target: '.joyride-app-status'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Take a tour</h2>
        <p className='tl f6'>Click this button to take a tour through the current page's features and highlights.</p>
      </div>,
      placement: 'left',
      target: '.joyride-app-tour'
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
      placement: 'left',
      target: '.joyride-status-traffic'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Explore</h2>
        <p className='tl f6'>Paste a CID and explore how that data is structured and linked across protocols.</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'right',
      target: '.joyride-app-explore'
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
        <p className='tl f6'>Here you can change the settings of your Web UI and IPFS node.</p>
        <p className='tl f6'>If you're running IPFS Desktop you'll have some specific settings for it too.</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Language selector</h2>
        <p className='tl f6'>You can change the language of the Web UI.
        If your preferred language isn't available, head over our project page in <a className='aqua link' href='https://www.transifex.com/ipfs/ipfs-webui/translate/' rel='noopener noreferrer' target='_blank'>Transifex</a> to help us translate!
        </p>
      </div>,
      placement: 'bottom',
      target: '.joyride-settings-language'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>Anonymous usage analytics</h2>
        <p className='tl f6'>If you opt-in, you can help us make the Web UI better by sending anonymous usage analytics.</p>
        <p className='tl f6'>You're able to choose what data you send us and we won't be able to identify you, we value privacy above all else.</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-settings-analytics'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>IPFS Config</h2>
        <p className='tl f6'>You can change the config of your IPFS node right from Web UI!</p>
        <p className='tl f6'>Don't forget to restart the daemon to apply the changes.</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'top',
      target: '.joyride-settings-config'
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
