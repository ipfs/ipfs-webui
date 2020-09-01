import React from 'react'

export const appTour = {
  getSteps: ({ t }) => [{
    content: <div className='montserrat white'>
      <p className='ma0 pa0 tl f6'>{t('tour.tooltip')}</p>
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

export const welcomeTour = {
  getSteps: ({ t, Trans }) => [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph3')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#378085',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const statusTour = {
  getSteps: ({ t, Trans }) => [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6'>{t('tour.step2.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step2.paragraph2')}</p>
      </div>,
      placement: 'left',
      target: '.joyride-app-status'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6'>{t('tour.step3.paragraph1')}</p>
        <Trans i18nKey='tour.step3.paragraph2' t={t}>
          <p className='tl f6'>Click on <code>Advanced</code> to see more info such as the gateway URL and addresses.</p>
        </Trans>
      </div>,
      placement: 'bottom',
      target: '.joyride-status-node'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step4.title')}</h2>
        <p className='tl f6'>{t('tour.step4.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step4.paragraph2')}</p>
      </div>,
      placement: 'top',
      target: '.joyride-status-charts'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.stepExplore.title')}</h2>
        <p className='tl f6'>{t('tour.stepExplore.paragraph')}</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'right',
      target: '.joyride-app-explore'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#378085',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const filesTour = {
  getSteps: ({ t, Trans }) => [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <Trans i18nKey='tour.step1.paragraph1' t={t}>
          <p className='tl f6'>
            This is where the files on your <a className='teal link' href='https://docs.ipfs.io/guides/concepts/mfs/' rel='noopener noreferrer' target='_blank'>
            Mutable File System (MFS)</a> live. You can add files or folders and manage them from this page.
          </p>
        </Trans>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6'>{t('tour.step2.paragraph1')}</p>
        <ul className='pl4'>
          <li className='tl f6'>{t('tour.step2.bullet1')}</li>
          <li className='tl f6'>{t('tour.step2.bullet2')}</li>
          <li className='tl f6'>{t('tour.step2.bullet3')}</li>
        </ul>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-breadcrumbs'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6'>{t('tour.step3.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step3.paragraph2')}</p>
        <Trans i18nKey='tour.step3.paragraph3' t={t}>
          <p className='tl f6'>
            If you want to add something that is already on IPFS, you can import it to your MFS by passing its <a className='teal link' href='https://docs.ipfs.io/guides/concepts/cid/' rel='noopener noreferrer' target='_blank'>Content
            Identifier (CID)</a>.
          </p>
        </Trans>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-add'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step5.title')}</h2>
        <p className='tl f6'>{t('tour.step5.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step5.paragraph2')}</p>
        <p className='tl f6'>{t('tour.step5.paragraph3')}</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'center',
      target: 'body'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#378085',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const peersTour = {
  getSteps: ({ t }) => [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6'>{t('tour.step2.paragraph1')}</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-peers-map'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6'>{t('tour.step3.paragraph1')}</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'top',
      target: '.joyride-peers-table'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#378085',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const settingsTour = {
  getSteps: ({ t, Trans }) => [
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <Trans i18nKey='tour.step2.paragraph1' t={t}>
          <p className='tl f6'>You can change the language of the Web UI.
          If your preferred language isn't available, head over our project page in <a className='teal link' href='https://www.transifex.com/ipfs/ipfs-webui/translate/' rel='noopener noreferrer' target='_blank'>Transifex</a> to help us translate!
          </p>
        </Trans>
      </div>,
      placement: 'bottom',
      target: '.joyride-settings-language'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6'>{t('tour.step3.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step3.paragraph2')}</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-settings-analytics'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step4.title')}</h2>
        <p className='tl f6'>{t('tour.step4.paragraph1')}</p>
      </div>,
      placement: 'top',
      target: '.joyride-settings-customapi'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step5.title')}</h2>
        <p className='tl f6'>{t('tour.step5.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step5.paragraph2')}</p>
      </div>,
      locale: { last: 'Finish' },
      placement: 'top',
      target: '.joyride-settings-config'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#378085',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}
