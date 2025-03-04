import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal.js'
import Button from '../../../components/button/button.tsx'
import StrokeMove from '../../../icons/StrokeMove.js'
import { withTranslation } from 'react-i18next'
import StrokeInfo from '../../../icons/StrokeInfo.js'

const DirectoryInput = ({ value, onChange, suggestions, onKeyPress, className, t }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [showTooltip, setShowTooltip] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const listboxId = 'directory-suggestions-listbox'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    if (!suggestions.length) return

    if (e.keyCode === 40 || e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.keyCode === 38 || e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => Math.max(prev - 1, -1))
    } else if ((e.keyCode === 13 || e.key === 'Enter') && activeSuggestion >= 0) {
      e.preventDefault()
      onChange(suggestions[activeSuggestion])
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  const selectSuggestion = (suggestion) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-90 center">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(true)
            setActiveSuggestion(-1)
          }}
          onKeyPress={onKeyPress}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className={`input-reset charcoal ba b--black-20 br1 pa2 mb2 db flex-auto focus-outline ${className}`}
          placeholder="/files/path/to/directory"
          aria-label="Directory path"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="ml2 mb2 flex-none relative">
          <div className="relative" style={{ zIndex: 999 }}>
            <button
              className="button-reset pointer pa2 hover-bg-near-white br2 transition-all relative"
              type="button"
              aria-label={t('moveModal.directoryCreationInfo')}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(true)}
            >
              <StrokeInfo
                width="20"
                height="20"
                className="fill-navy hover-fill-navy-muted transition-all"
              />
            </button>
            {showTooltip && (
              <div
                className="absolute left-0 bg-navy white pa2 br2 f6 nowrap shadow-4"
                style={{
                  top: '100%',
                  marginTop: '8px',
                  whiteSpace: 'normal',
                  zIndex: 999,
                  width: '200px',
                  transform: 'translateX(-50%)',
                  left: '25%'
                }}
                role="tooltip"
              >
                {t('moveModal.directoryCreationInfo')}
                <div
                  className="absolute top-0 left-0 bg-navy"
                  style={{
                    width: '8px',
                    height: '8px',
                    transform: 'translate(50%, -4px) rotate(45deg)',
                    left: '50%'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div
          id={listboxId}
          ref={suggestionsRef}
          className="absolute left-0 right-0 bg-white ba b--black-10 br1 shadow-1 z-1 max-h-5 overflow-auto"
          style={{ top: 'calc(100% - 0.5rem)', width: 'calc(100% - 44px)' }}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              className={`w-100 tl pa2 pointer hover-bg-light-gray bn bg-transparent ${index === activeSuggestion ? 'bg-light-gray' : ''}`}
              onClick={() => selectSuggestion(suggestion)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.keyCode === 13) || (e.key === ' ' || e.keyCode === 32)) {
                  e.preventDefault()
                  selectSuggestion(suggestion)
                }
              }}
              role="option"
              aria-selected={index === activeSuggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MoveModal ({ t, tReady, mainFiles, files, onCancel, onSubmit, source, destination, folder, count, className, onFetchDirectory: doFetchDirectory, ...props }) {
  const [value, setValue] = useState(destination)
  const [suggestions, setSuggestions] = useState([])
  const fetchTimeoutRef = useRef(null)
  const formatPath = (path) => {
    const normalizedPath = path.startsWith('/files') ? path.substring(6) : path
    return normalizedPath.split('/').filter(e => !!e).join('/')
  }

  const disabledPath = files.filter(e => e.type === 'directory').map(e => formatPath(e.path)).includes(formatPath(value))

  useEffect(() => {
    let isMounted = true

    const fetchSuggestions = async () => {
      if (!value || typeof value !== 'string') {
        setSuggestions([])
        return
      }

      try {
        const parts = value.toString().split('/')
        const currentInput = parts[parts.length - 1] || ''

        let entries = []
        try {
          const normalizedValue = value.replace(/^\/files/, '')
          const result = formatPath(value) === formatPath(mainFiles.path)
            ? mainFiles.content.filter(entry => entry.type === 'directory').map(entry => ({ path: entry.path, name: entry.name }))
            : ((await doFetchDirectory(normalizedValue))?.content || [])?.map(entry => ({
                ...entry,
                path: `/files${normalizedValue}/${entry.name}`.replace(/\/+/g, '/')
              }))

          if (result && Array.isArray(result)) {
            entries = result.map(entry => entry.path)
          }
        } catch (err) {
          console.error('Error fetching directory entries:', err)
        }

        const ignorePath = files.filter(e => e.type === 'directory').map(e => formatPath(e.path))

        const filteredSuggestions = entries.filter(path =>
          path.toLowerCase().includes((currentInput || '').toLowerCase()) &&
          path !== value && !ignorePath.includes(formatPath(path))
        )

        if (isMounted) {
          setSuggestions([...new Set(filteredSuggestions)])
        }
      } catch (err) {
        console.error('Error fetching directory suggestions:', err)
        if (isMounted) {
          setSuggestions([])
        }
      }
    }

    // a little bit of debouncing, to avoid too many requests
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions()
    }, 350)

    return () => {
      isMounted = false
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
      setSuggestions([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, source, doFetchDirectory])

  const context = folder ? 'Folder' : 'Files'
  const title = t(`moveModal.title${context}`, { count })
  const description = t(`moveModal.description${context}`, { source, count })

  const onKeyPress = (event) => {
    if (event.key === 'Enter' && !suggestions.length) {
      const normalizedValue = value.startsWith('/files') ? value : `/files${value}`
      onSubmit(normalizedValue)
    }
  }

  return (
    <Modal {...props} className={className} onCancel={onCancel}>
      <ModalBody title={title} Icon={StrokeMove}>
        {description && <p className='charcoal w-90 tl center'>{description}</p>}

        <DirectoryInput
          value={value}
          onChange={setValue}
          suggestions={suggestions}
          onKeyPress={onKeyPress}
          className={value === destination ? '' : 'b--green-muted focus-outline-green'}
          t={t}
        />
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
        <Button
          className='ma2 tc'
          bg='bg-teal'
          disabled={!value || value === destination || disabledPath}
          onClick={() => {
            const normalizedValue = value.startsWith('/files') ? value : `/files${value}`
            onSubmit(normalizedValue)
          }}
        >
          {t('app:actions.move')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

MoveModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  source: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  folder: PropTypes.bool,
  count: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired,
  mainFiles: PropTypes.object.isRequired
}

MoveModal.defaultProps = {
  className: '',
  folder: false
}

export default withTranslation('files')(MoveModal)
