import React from 'react'

/**
 * Get CSS variable value from document
 * @param {string} name - CSS variable name (e.g., '--theme-bg-modal')
 * @returns {string} CSS variable value
 */
export function cssVar (name) {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Get evaluated styles for a tour
 * This evaluates CSS variables at call time for React Joyride
 * @param {string} width - Width of the tooltip (e.g., '500px')
 * @returns {object} Evaluated styles object
 */
export const getEvaluatedTourStyles = (width = '500px') => ({
  options: {
    width,
    backgroundColor: cssVar('--theme-bg-modal') || '#2d2d2d',
    textColor: cssVar('--theme-text-primary') || '#ffffff',
    arrowColor: cssVar('--theme-bg-modal') || '#2d2d2d',
    primaryColor: cssVar('--theme-brand-aqua') || '#69c4cd',
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999
  }
})

export const appTour = {
  /**
   * @param {{ t: any }} params
   */
  getSteps: ({ t }) => [{
    content: <div className='montserrat'>
      <p className='ma0 pa0 tl f6'>{t('tour.tooltip')}</p>
    </div>,
    placement: 'left',
    target: '.joyride-app-tour',
    disableBeacon: true
  }],
  getStyles: () => ({
    tooltipContent: { padding: '0 20px 0 0' },
    tooltipFooter: { display: 'none' },
    options: {
      width: '250px',
      backgroundColor: cssVar('--theme-brand-aqua') || '#69c4cd',
      arrowColor: cssVar('--theme-brand-aqua') || '#69c4cd',
      textColor: '#fff',
      zIndex: 999
    }
  })
}

export const welcomeTour = {
  /**
   * @param {{ t: any }} params
   */
  getSteps: ({ t }) => [
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph3')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    }
  ],
  getStyles: () => getEvaluatedTourStyles('500px')
}

export const statusTour = {
  /**
   * @param {{ t: any, Trans: any }} params
   */
  getSteps: ({ t, Trans }) => [
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6'>{t('tour.step2.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step2.paragraph2')}</p>
      </div>,
      placement: 'left',
      target: '.joyride-app-status'
    },
    {
      content: <div className='montserrat'>
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
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step4.title')}</h2>
        <p className='tl f6'>{t('tour.step4.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step4.paragraph2')}</p>
      </div>,
      placement: 'top',
      target: '.joyride-status-charts'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.stepExplore.title')}</h2>
        <p className='tl f6'>{t('tour.stepExplore.paragraph')}</p>
      </div>,
      locale: { last: t('tour.finish') },
      placement: 'right',
      target: '.joyride-app-explore'
    }
  ],
  getStyles: () => getEvaluatedTourStyles('500px')
}

export const filesTour = {
  /**
   * @param {{ t: any, Trans: any }} params
   */
  getSteps: ({ t, Trans }) => [
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <Trans i18nKey='tour.step1.paragraph1' t={t}>
          <p className='tl f6'>
            This is where the files on your <a className='teal link' href='https://docs.ipfs.tech/concepts/file-systems/' rel='noopener noreferrer' target='_blank'>
            Mutable File System (MFS)</a> live. You can add files or folders and manage them from this page.
          </p>
        </Trans>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat'>
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
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6'>{t('tour.step3.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step3.paragraph2')}</p>
        <Trans i18nKey='tour.step3.paragraph3' t={t}>
          <p className='tl f6'>
            If you want to add something that is already on IPFS, you can import it to your MFS by passing its <a className='teal link' href='https://docs.ipfs.tech/concepts/content-addressing/' rel='noopener noreferrer' target='_blank'>Content
            Identifier (CID)</a>.
          </p>
        </Trans>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-add'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step6.title')}</h2>
        <p className='tl f6'>{t('tour.step6.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step6.paragraph2')}</p>
      </div>,
      placement: 'bottom',
      target: '.filegrid-view'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step5.title')}</h2>
        <p className='tl f6'>{t('tour.step5.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step5.paragraph2')}</p>
        <p className='tl f6'>{t('tour.step5.paragraph3')}</p>
      </div>,
      locale: { last: t('tour.finish') },
      placement: 'bottom',
      target: '.filelist-view'
    }
  ],
  getStyles: () => getEvaluatedTourStyles('500px')
}

export const peersTour = {
  /**
   * @param {{ t: any }} params
   */
  getSteps: ({ t }) => [
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6'>{t('tour.step2.paragraph1')}</p>
      </div>,
      placement: 'bottom',
      target: '.joyride-peers-map'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6'>{t('tour.step3.paragraph1')}</p>
      </div>,
      locale: { last: t('tour.finish') },
      placement: 'top',
      target: '.joyride-peers-table'
    }
  ],
  getStyles: () => getEvaluatedTourStyles('500px')
}

export const settingsTour = {
  /**
   * @param {{ t: any, Trans: any }} params
   */
  getSteps: ({ t, Trans }) => [
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6'>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6'>{t('tour.step2.paragraph1')}</p>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-customapi'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <Trans i18nKey='tour.step3.paragraph1' t={t}>
          <p className='tl f6'>If you have accounts with third-party remote pinning services, add them here so you can pin/unpin items to those services directly from the Files screen. You can learn more about third-party pinning services in the <a className='teal link' href='https://docs.ipfs.tech/how-to/work-with-pinning-services' rel='noopener noreferrer' target='_blank'>IPFS Docs</a>.
          </p>
        </Trans>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-pinning'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step4.title')}</h2>
        <Trans i18nKey='tour.step4.paragraph1' t={t}>
          <p className='tl f6'>You can change the language of the Web UI.
          If your preferred language isn't available, head over our project page in <a className='teal link' href='https://www.transifex.com/ipfs/ipfs-webui/translate/' rel='noopener noreferrer' target='_blank'>Transifex</a> to help us translate!
          </p>
        </Trans>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-language'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step5.title')}</h2>
        <p className='tl f6'>{t('tour.step5.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step5.paragraph2')}</p>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-analytics'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step6.title')}</h2>
        <p className='tl f6'>{t('tour.step6.paragraph1')}</p>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-tutormode'
    },
    {
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('tour.step7.title')}</h2>
        <p className='tl f6'>{t('tour.step7.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step7.paragraph2')}</p>
      </div>,
      locale: { last: t('tour.finish') },
      placement: 'auto',
      target: '.joyride-settings-config'
    }
  ],
  getStyles: () => getEvaluatedTourStyles('500px')
}
