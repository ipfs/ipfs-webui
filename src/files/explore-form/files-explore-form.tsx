import React, { useCallback, useMemo, useState } from 'react'
import * as isIPFS from 'is-ipfs'
import { useTranslation } from 'react-i18next'
import StrokeFolder from '../../icons/StrokeFolder.js'
import StrokeIpld from '../../icons/StrokeIpld.js'
import Button from '../../components/button/button'
import './files-explore-form.css'
// @ts-expect-error - need to fix types for ipfs-webui since we are a CJS consumer...
import { useExplore } from 'ipld-explorer-components/providers'
import { useTheme } from '../../hooks/theme'

/**
 * @type {React.FC<{ onBrowse: (evt: { path: string }) => void }>} *
 */
const FilesExploreForm = ({ onBrowse: onBrowseProp }) => {
  const [path, setPath] = useState('')
  const { doExploreUserProvidedPath } = useExplore()
  const { t } = useTranslation('files')
  const { darkTheme: isDarkTheme } = useTheme()

  const trimmedPath = useMemo(() => {
    return path.trim()
  }, [path])

  const isValid = useMemo(() => {
    return trimmedPath !== '' && (isIPFS.cid(trimmedPath) || isIPFS.path(trimmedPath))
  }, [trimmedPath])

  const inputClass = useMemo(() => {
    if (trimmedPath === '') {
      return 'focus-outline'
    }

    if (isValid) {
      return 'b--green-muted focus-outline-green'
    } else {
      return 'b--red-muted focus-outline-red'
    }
  }, [trimmedPath, isValid])

  const onChange = (evt) => {
    setPath(evt.target.value)
  }
  const onKeyDown = (evt) => {
    if (evt.key === 'Enter') {
      onBrowse(evt)
    }
  }
  const onInspect = useCallback((evt) => {
    evt.preventDefault()

    if (isValid) {
      doExploreUserProvidedPath(trimmedPath)
      setPath('')
    }
  }, [doExploreUserProvidedPath, isValid, trimmedPath])

  const onBrowse = useCallback((evt) => {
    evt.preventDefault()

    if (isValid) {
      let browsePath = trimmedPath
      if (isIPFS.cid(trimmedPath)) {
        browsePath = `/ipfs/${trimmedPath}`
      }

      onBrowseProp({ path: browsePath })
      setPath('')
    }
  }, [isValid, trimmedPath, onBrowseProp])

  return (
      <div data-id='FilesExploreForm' className='sans-serif black-80 flex'>
        <div className='flex-auto'>
          <div className='relative'>
            <input id='ipfs-path' className={`input-reset bn pa2 mb2 db w-100 f6 br-0 placeholder-light ${inputClass}`} style={{ borderRadius: '3px 0 0 3px', background: isDarkTheme ? 'var(--input-bg-dark)' : '' }} type='text' placeholder='QmHash/bafyHash' aria-describedby='ipfs-path-desc' onChange={onChange} onKeyDown={onKeyDown} value={path} />
            <small id='ipfs-path-desc' className='o-0 absolute f6 black-60 db mb2'>Paste in a CID or IPFS path</small>
          </div>
        </div>
        <div className='flex flex-row-reverse mb2'>
          <Button
            minWidth={0}
            disabled={!isValid}
            danger={!isValid}
            title={t('app:actions.inspect')}
            style={{ borderRadius: '0 3px 3px 0', background: isDarkTheme ? 'var(--input-btn-bg)' : '' }}
            onClick={onInspect}
            bg='bg-teal'
            className='ExploreFormButton button-reset pv1 ph2 ba f7 fw4 white overflow-hidden tc' >
            <StrokeIpld style={{ height: '2em' }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('app:actions.inspect')}</span>
          </Button>
          <Button
            minWidth={0}
            disabled={!isValid}
            danger={!isValid}
            style={{ borderRadius: '0', background: isDarkTheme ? 'var(--input-btn-bg)' : '' }}
            title={t('app:actions.browse')}
            onClick={onBrowse}
            className='ExploreFormButton button-reset pv1 ph2 ba f7 fw4 white bg-gray overflow-hidden tc' >
            <StrokeFolder style={{ height: '2em' }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('app:actions.browse')}</span>
          </Button>
        </div>
      </div>
  )
}

export default FilesExploreForm
