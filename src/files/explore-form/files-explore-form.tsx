import React, { useCallback, useMemo, useState } from 'react'
import * as isIPFS from 'is-ipfs'
import { useTranslation } from 'react-i18next'
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

/**
 * Normalize input to a canonical path format:
 * - ipfs://CID -> /ipfs/CID
 * - ipns://name -> /ipns/name
 * - Existing paths pass through unchanged
 */
const normalizeToPath = (input: string): string => {
  if (input.startsWith('ipfs://')) {
    return '/ipfs/' + input.slice(7)
  }
  if (input.startsWith('ipns://')) {
    return '/ipns/' + input.slice(7)
  }
  return input
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
    if (trimmedPath === '') return false
    // Accept native protocol URLs
    if (trimmedPath.startsWith('ipfs://') || trimmedPath.startsWith('ipns://')) {
      const asPath = normalizeToPath(trimmedPath)
      return isIPFS.path(asPath)
    }
    return isIPFS.cid(trimmedPath) || isIPFS.path(trimmedPath)
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

    // Normalize URL to path format
    const normalizedPath = normalizeToPath(trimmedPath)

    // For bare CIDs, pass directly to explorer
    if (isIPFS.cid(trimmedPath)) {
      doExploreUserProvidedPath(trimmedPath)
      setPath('')
      return
    }

    // For paths (/ipfs/ or /ipns/), resolve to final CID
    if (ipfs != null && (normalizedPath.startsWith('/ipfs/') || normalizedPath.startsWith('/ipns/'))) {
      setIsResolving(true)
      try {
        // ipfs.resolve with recursive:true handles both IPNS resolution
        // and path traversal to get the final CID
        const resolved = await ipfs.resolve(normalizedPath, { recursive: true })
        // resolved is like "/ipfs/bafyabc123" - extract just the CID
        const cid = resolved.replace(/^\/ipfs\//, '')
        doExploreUserProvidedPath(cid)
        setPath('')
      } catch (err) {
        console.error('Failed to resolve path:', err)
        setResolveError(t('inspectResolveFailed', { path: normalizedPath }))
      } finally {
        setIsResolving(false)
      }
      return
    }

    // Fallback for other valid inputs
    doExploreUserProvidedPath(trimmedPath)
    setPath('')
  }, [doExploreUserProvidedPath, ipfs, isValid, t, trimmedPath])

  const onBrowse = useCallback((evt: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()

    if (isValid) {
      // Normalize URL to path, but preserve the full path for Files
      // (Files system handles IPNS and subpaths natively)
      let browsePath = normalizeToPath(trimmedPath)
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
