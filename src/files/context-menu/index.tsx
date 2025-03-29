import React, { useRef, useEffect, forwardRef } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Dropdown, DropdownMenu, Option } from '../dropdown/dropdown.tsx'
import StrokeCopy from '../../icons/StrokeCopy.js'
import StrokeShare from '../../icons/StrokeShare.js'
import StrokeSpeaker from '../../icons/StrokeSpeaker.js'
import StrokePencil from '../../icons/StrokePencil.js'
import StrokeIpld from '../../icons/StrokeIpld.js'
import StrokeTrash from '../../icons/StrokeTrash.js'
import StrokeDownload from '../../icons/StrokeDownload.js'
import StrokeData from '../../icons/StrokeData.js'
import StrokePin from '../../icons/StrokePin.js'
import { cliCmdKeys } from '../../bundles/files/consts.js'

interface ContextMenuProps extends WithTranslation {
  isMfs: boolean
  isOpen: boolean
  isUnknown: boolean
  hash?: string
  cid?: string
  pinned?: boolean
  handleClick: () => void
  translateX: number
  translateY: number
  left: number
  onRemove?: () => void
  onRename?: () => void
  onDownload?: () => void
  onDownloadCar?: () => void
  onInspect?: () => void
  onShare?: () => void
  onPublish?: () => void
  onPinning?: () => void
  doSetCliOptions?: (options?: unknown) => void
  className?: string
  autofocus?: boolean
  isCliTutorModeEnabled?: boolean
}

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>((props, ref) => {
  const dropdownMenuRef = useRef<HTMLDivElement>(null)

  // Handle autofocus
  useEffect(() => {
    if (props.autofocus && props.isOpen && dropdownMenuRef.current) {
      const firstButton = dropdownMenuRef.current.querySelector('button')
      if (firstButton) {
        firstButton.focus()
      }
    }
  }, [props.autofocus, props.isOpen])

  const wrap = (name: string, cliOptions?: unknown) => () => {
    if (name === 'onCliTutorMode' && cliOptions && props.doSetCliOptions) {
      props.doSetCliOptions(cliOptions)
    }
    const handler = props[name as keyof ContextMenuProps]
    if (typeof handler === 'function') {
      handler()
    }
    props.handleClick()
  }

  const {
    t, onRename, onRemove, onDownload, onInspect, onShare, onDownloadCar, onPublish,
    translateX, translateY, className, isMfs, isUnknown, isCliTutorModeEnabled
  } = props

  return (
    <div ref={ref} className='relative'>
    <Dropdown className={className}>
      <DropdownMenu
        ref={dropdownMenuRef}
        top={-8}
        arrowMarginRight='11px'
        left='calc(100% - 200px)'
        translateX={-translateX}
        translateY={-translateY}
        open={props.isOpen}
        onDismiss={props.handleClick}>
        {onShare && (
          <Option onClick={wrap('onShare')}>
            <StrokeShare className='w2 mr2 fill-aqua' />
            {t('actions.share')}
          </Option>
        )}
        <CopyToClipboard text={String(props.cid)} onCopy={props.handleClick}>
          <Option>
            <StrokeCopy className='w2 mr2 fill-aqua' />
            {t('actions.copyHash')}
          </Option>
        </CopyToClipboard>
        {onInspect && (
          <Option onClick={wrap('onInspect')}>
            <StrokeIpld className='w2 mr2 fill-aqua' />
            {t('app:actions.inspect')}
          </Option>
        )}
        <Option
          onClick={wrap('onPinning')}
          isCliTutorModeEnabled={isCliTutorModeEnabled}
          onCliTutorMode={wrap('onCliTutorMode', cliCmdKeys.PIN_OBJECT)}>
          <StrokePin className='w2 mr2 fill-aqua' />
          {t('app:actions.setPinning')}
        </Option>
        {!isUnknown && onDownload && (
          <Option
            onClick={wrap('onDownload')}
            isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={wrap('onCliTutorMode', cliCmdKeys.DOWNLOAD_OBJECT_COMMAND)}>
            <StrokeDownload className='w2 mr2 fill-aqua' />
            {t('app:actions.download')}
          </Option>
        )}
        {!isUnknown && onDownloadCar && (
          <Option
            onClick={wrap('onDownloadCar')}
            isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={wrap('onCliTutorMode', cliCmdKeys.DOWNLOAD_CAR_COMMAND)}>
            <StrokeData className='w2 mr2 fill-aqua' />
            {t('app:actions.downloadCar')}
          </Option>
        )}
        {!isUnknown && isMfs && onRename && (
          <Option
            onClick={wrap('onRename')}
            isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={wrap('onCliTutorMode', cliCmdKeys.RENAME_IPFS_OBJECT)}>
            <StrokePencil className='w2 mr2 fill-aqua' />
            {t('app:actions.rename')}
          </Option>
        )}
        {!isUnknown && isMfs && onRemove && (
          <Option
            onClick={wrap('onRemove')}
            isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={wrap('onCliTutorMode', cliCmdKeys.REMOVE_FILE_FROM_IPFS)}>
            <StrokeTrash className='w2 mr2 fill-aqua' />
            {t('app:actions.remove')}
          </Option>
        )}
        {onPublish && (
          <Option
            onClick={wrap('onPublish')}
            isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={wrap('onCliTutorMode', cliCmdKeys.PUBLISH_WITH_IPNS)}>
            <StrokeSpeaker className='w2 mr2 fill-aqua' />
            {t('actions.publishWithIpns')}
          </Option>
        )}
      </DropdownMenu>
    </Dropdown>
    </div>
  )
})

export default withTranslation('files', { withRef: true })(ContextMenu)
