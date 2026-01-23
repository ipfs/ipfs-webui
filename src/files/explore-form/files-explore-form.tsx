import React, { useCallback, useMemo, useState } from 'react'
import * as isIPFS from 'is-ipfs'
import { useTranslation } from 'react-i18next'
import last from 'it-last'
import StrokeFolder from '../../icons/StrokeFolder.js'
import StrokeIpld from '../../icons/StrokeIpld.js'
import Button from '../../components/button/button'
import './files-explore-form.css'
// @ts-expect-error - need to fix types for ipfs-webui since we are a CJS consumer...
import { useExplore } from 'ipld-explorer-components/providers'
import { useBridgeSelector } from '../../helpers/context-bridge'
import type { KuboRPCClient } from 'kubo-rpc-client'

interface FilesExploreFormProps {
  // this prop is being passed as the `doFilesNavigateTo` action from the `files` bundle in App.js
  onBrowse: ({ path, cid }: {path: string, cid?: string}) => void
}

const FilesExploreForm: React.FC<FilesExploreFormProps> = ({ onBrowse: onBrowseProp }) => {
  const [path, setPath] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const { doExploreUserProvidedPath } = useExplore()
  const { t } = useTranslation('files')
  const ipfs = useBridgeSelector('selectIpfs') as KuboRPCClient | null

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

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    setPath(evt.target.value)
    if (resolveError != null) {
      setResolveError(null)
    }
  }
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (evt) => {
    if (evt.key === 'Enter') {
      onBrowse(evt)
    }
  }
  const onInspect = useCallback(async (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()

    if (!isValid) return

    setResolveError(null)
    let pathToExplore = trimmedPath

    // IPNS paths need to be resolved to /ipfs/ paths before passing to the IPLD explorer,
    // which expects CIDs and cannot parse IPNS names directly
    if (trimmedPath.startsWith('/ipns/') && ipfs != null) {
      setIsResolving(true)
      try {
        const resolved = await last(ipfs.name.resolve(trimmedPath, { recursive: true }))
        if (resolved != null) {
          pathToExplore = resolved
        } else {
          setResolveError(t('inspectIpnsResolveFailed', { path: trimmedPath }))
          setIsResolving(false)
          return
        }
      } catch (err) {
        console.error('Failed to resolve IPNS path:', err)
        setResolveError(t('inspectIpnsResolveFailed', { path: trimmedPath }))
        setIsResolving(false)
        return
      }
      setIsResolving(false)
    }

    doExploreUserProvidedPath(pathToExplore)
    setPath('')
  }, [doExploreUserProvidedPath, ipfs, isValid, t, trimmedPath])

  const onBrowse = useCallback((evt: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()

    if (isValid) {
      let browsePath = trimmedPath
      let cid
      if (isIPFS.cid(trimmedPath)) {
        browsePath = `/ipfs/${trimmedPath}`
        cid = trimmedPath
      }

      onBrowseProp({ path: browsePath, cid })
      setPath('')
    }
  }, [isValid, trimmedPath, onBrowseProp])

  return (
      <div data-id='FilesExploreForm' className='sans-serif black-80'>
        <div className='flex'>
          <div className='flex-auto'>
            <div className='relative'>
              <input id='ipfs-path' className={`input-reset bn pa2 mb2 db w-100 f6 br-0 placeholder-light ${inputClass}`} style={{ borderRadius: '3px 0 0 3px' }} type='text' placeholder='QmHash/bafyHash' aria-describedby='ipfs-path-desc' onChange={onChange} onKeyDown={onKeyDown} value={path} />
              <small id='ipfs-path-desc' className='o-0 absolute f6 black-60 db mb2'>Paste in a CID or IPFS path</small>
            </div>
          </div>
          <div className='flex flex-row-reverse mb2'>
            <Button
              minWidth={0}
              disabled={!isValid || isResolving}
              danger={!isValid}
              title={t('app:actions.inspect')}
              style={{ borderRadius: '0 3px 3px 0' }}
              onClick={onInspect}
              bg='bg-teal'
              className={`ExploreFormButton button-reset pv1 ph2 ba f7 fw4 white overflow-hidden tc ${isResolving ? 'o-50' : ''}`} >
              <StrokeIpld style={{ height: '2em' }} className='dib fill-current-color v-mid' />
              <span className='ml2'>{isResolving ? t('app:actions.inspectResolving') : t('app:actions.inspect')}</span>
            </Button>
            <Button
              minWidth={0}
              disabled={!isValid}
              danger={!isValid}
              style={{ borderRadius: '0' }}
              title={t('app:actions.browse')}
              onClick={onBrowse}
              className='ExploreFormButton button-reset pv1 ph2 ba f7 fw4 white bg-gray overflow-hidden tc' >
              <StrokeFolder style={{ height: '2em' }} className='dib fill-current-color v-mid' />
              <span className='ml2'>{t('app:actions.browse')}</span>
            </Button>
          </div>
        </div>
        {resolveError != null && (
          <div className='f6 red db mb2'>{resolveError}</div>
        )}
      </div>
  )
}

export default FilesExploreForm
