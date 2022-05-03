import React, { useEffect, useRef, useState } from 'react'
import RetroBorderButton from '../components/common/atoms/RetroBorderButton'
import RetroButton from '../components/common/atoms/RetroButton'
import RetroText from '../components/common/atoms/RetroText'
import Modal from '../components/modal/Modal'

export const TourComponent = ({ t, onLeave, steps, className, ...props }) => {
  const [step, setStep] = useState(0)

  const hightlight = useRef(null)

  useEffect(() => {
    if (getHightlight() && hightlight && hightlight.current) {
      console.log(step, hightlight)
      if (hightlight.current.children.length > 0) {
        hightlight.current.removeChild(hightlight.current.children[0])
      }
      hightlight.current.appendChild(getHightlight())
    }
  }, [step])

  const getHightlightSize = () => {
    const targets = document.getElementsByClassName(steps[step].target)
    if (targets && targets.length > 0) {
      const target = targets[0]
      const size = target.getBoundingClientRect()
      return { width: size.width + 20, height: size.height + 20, left: size.x }
    } else {
      return { width: '0px', height: '0px' }
    }
  }

  const getHightlight = () => {
    const targets = document.getElementsByClassName(steps[step].target)
    console.log(steps[step].target, targets)
    if (targets && targets.length > 0) {
      const target = targets[0]
      return target
    } else {
      return null
    }
  }

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      background: 'rgba(17, 13, 33, 0.4)',
      'backdrop-filter': 'blur(10px)',
      zIndex: 10000
    }}>
      {
        steps[step].target &&
        <div ref={hightlight}
          style={{
            position: 'absolute',
            border: '1px solid #FFFFFF',
            top: '20px',
            padding: '10px',
            ...getHightlightSize()
          }}></div>
      }
      <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onLeave} style={{ maxWidth: '24em' }}>
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '130px', paddingRight: '130px' }}>
          {
            steps && step <= steps.length && steps[step].content
          }
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '30px' }}>
            { step > 0 && step < steps.length - 1 &&
              <RetroBorderButton width='102px' height='34px' className='tc' onClick={handlePrevious}
                style={{ marginRight: '10px' }}>
                <RetroText className='white spacegrotesk'>
                  Previous
                </RetroText>
              </RetroBorderButton>
            }
            { step < steps.length - 1 &&
              <RetroButton width='102px' height='34px' className='tc' onClick={handleNext}
                backgroundColor='white'
                style={{ marginRight: '10px' }}>
                <RetroText className='black spacegrotesk'>
                  Next
                </RetroText>
              </RetroButton>
            }
            { step === steps.length - 1 &&
              <RetroButton width='102px' height='34px' className='tc' onClick={onLeave}
                backgroundColor='white'
                style={{ marginRight: '10px' }}>
                <RetroText className='black spacegrotesk'>
                  Finish
                </RetroText>
              </RetroButton>
            }
            <div style={{ flex: 1 }}/>
            <span className='white spacegrotesk' style={{ fontSize: '12px' }}>tip {step + 1} out of {step.length}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

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
      content: <div className='montserrat'>
        <h2 className='f3 fw4'>{t('title')}</h2>
        <p className='tl f6'>{t('paragraph1')}</p>
        <p className='tl f6'>{t('paragraph2')}</p>
        <p className='tl f6'>{t('paragraph3')}</p>
      </div>,
      placement: 'center'
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
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step1.paragraph1')}</p>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center'
    },
    {
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step2.paragraph1')}</p>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step2.paragraph2')}</p>
      </div>,
      placement: 'left'
      // target: 'joyride-app-status'
    },
    {
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step3.paragraph1')}</p>
        <Trans i18nKey='tour.step3.paragraph2' t={t}>
          <p className='tl f6' style={{ opacity: '0.6' }}>Click on <code>Advanced</code> to see more info such as the gateway URL and addresses.</p>
        </Trans>
      </div>,
      placement: 'bottom',
      target: 'joyride-status-node'
    },
    {
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step4.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step4.paragraph1')}</p>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step4.paragraph2')}</p>
      </div>,
      placement: 'top',
      target: 'joyride-status-charts'
    },
    {
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.stepExplore.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.stepExplore.paragraph')}</p>
      </div>,
      locale: { last: t('tour.finish') },
      placement: 'right',
      target: 'joyride-app-explore'
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
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step1.title')}</h2>
        <Trans i18nKey='tour.step1.paragraph1' t={t}>
          <p className='tl f6' style={{ opacity: '0.6' }}>
            This is where the files on your <a className='teal link' href='https://docs.ipfs.io/concepts/file-systems/' rel='noopener noreferrer' target='_blank'>
            Mutable File System (MFS)</a> live. You can add files or folders and manage them from this page.
          </p>
        </Trans>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step1.paragraph2')}</p>
      </div>,
      placement: 'center',
      target: 'body'
    },
    {
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step2.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step2.paragraph1')}</p>
        <ul className='pl4'>
          <li className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step2.bullet1')}</li>
          <li className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step2.bullet2')}</li>
          <li className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step2.bullet3')}</li>
        </ul>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-breadcrumbs'
    },
    {
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step3.paragraph1')}</p>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step3.paragraph2')}</p>
        <Trans i18nKey='tour.step3.paragraph3' t={t}>
          <p className='tl f6'>
            If you want to add something that is already on IPFS, you can import it to your MFS by passing its <a className='teal link' href='https://docs.ipfs.io/concepts/content-addressing/' rel='noopener noreferrer' target='_blank'>Content
            Identifier (CID)</a>.
          </p>
        </Trans>
      </div>,
      placement: 'bottom',
      target: '.joyride-files-add'
    },
    {
      content: <div className='montserrat white'>
        <h2 className='f3 fw4'>{t('tour.step5.title')}</h2>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step5.paragraph1')}</p>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step5.paragraph2')}</p>
        <p className='tl f6' style={{ opacity: '0.6' }}>{t('tour.step5.paragraph3')}</p>
      </div>,
      locale: { last: t('tour.finish') },
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
      locale: { last: t('tour.finish') },
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
        <p className='tl f6'>{t('tour.step2.paragraph1')}</p>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-customapi'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step3.title')}</h2>
        <Trans i18nKey='tour.step3.paragraph1' t={t}>
          <p className='tl f6'>If you have accounts with third-party remote pinning services, add them here so you can pin/unpin items to those services directly from the Files screen. You can learn more about third-party pinning services in the <a className='teal link' href='https://docs.ipfs.io/how-to/work-with-pinning-services' rel='noopener noreferrer' target='_blank'>IPFS Docs</a>.
          </p>
        </Trans>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-pinning'
    },
    {
      content: <div className='montserrat charcoal'>
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
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step5.title')}</h2>
        <p className='tl f6'>{t('tour.step5.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step5.paragraph2')}</p>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-analytics'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step6.title')}</h2>
        <p className='tl f6'>{t('tour.step6.paragraph1')}</p>
      </div>,
      placement: 'auto',
      target: '.joyride-settings-tutormode'
    },
    {
      content: <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.step7.title')}</h2>
        <p className='tl f6'>{t('tour.step7.paragraph1')}</p>
        <p className='tl f6'>{t('tour.step7.paragraph2')}</p>
      </div>,
      locale: { last: t('tour.finish') },
      placement: 'auto',
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
