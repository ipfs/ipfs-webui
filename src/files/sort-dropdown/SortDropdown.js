import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { DropdownMenu } from '@tableflip/react-dropdown'
import { withTranslation } from 'react-i18next'
import { sorts } from '../../bundles/files/index.js'

const SortDropdown = ({ currentSort, onSortChange, t }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef()
  const dropdownRef = useRef()

  const sortOptions = [
    {
      value: sorts.BY_NAME,
      asc: true,
      label: t('sortByNameAsc')
    },
    {
      value: sorts.BY_NAME,
      asc: false,
      label: t('sortByNameDesc')
    },
    {
      value: sorts.BY_SIZE,
      asc: true,
      label: t('sortBySizeAsc')
    },
    {
      value: sorts.BY_SIZE,
      asc: false,
      label: t('sortBySizeDesc')
    },
    {
      value: sorts.BY_PINNED,
      asc: true,
      label: t('sortByPinnedFirst')
    },
    {
      value: sorts.BY_PINNED,
      asc: false,
      label: t('sortByUnpinnedFirst')
    },
    {
      value: sorts.BY_ORIGINAL,
      asc: true,
      label: t('sortByOriginal')
    }
  ]

  const handleSortChange = (sortValue, asc) => {
    onSortChange(sortValue, asc)
    setIsOpen(false)
  }

  const getCurrentLabel = () => {
    const option = sortOptions.find(opt =>
      opt.value === currentSort.by &&
      (opt.value === sorts.BY_ORIGINAL || opt.asc === currentSort.asc)
    )
    return option?.label || t('sortByNameAsc')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className="flex items-center justify-between pa2 ba br2 pointer"
        style={{
          minWidth: '140px',
          background: 'var(--theme-bg-primary)',
          borderColor: 'var(--theme-border-primary)'
        }}
        aria-label={t('sortFiles')}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--theme-bg-tertiary)' }}
        onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--theme-bg-primary)' }}
      >
        <span className="f6 truncate" style={{ color: 'var(--theme-text-primary)' }}>{getCurrentLabel()}</span>
        <span className="ml2 f6" style={{ color: 'var(--theme-text-secondary)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <DropdownMenu
          open={isOpen}
          className="sans-serif br2"
          background="var(--theme-bg-inverted)"
          boxShadow="rgba(105, 196, 205, 0.5) 0px 1px 10px 0px"
          width={200}
          arrowAlign="left"
          arrowMarginRight="20px"
          left="0"
          translateX="0"
          translateY="5px"
          onDismiss={() => setIsOpen(false)}
        >
          <div className="flex flex-column" role="menu" style={{ color: 'var(--theme-text-primary)' }}>
            {sortOptions.map((option) => (
              <button
                key={`${option.value}-${option.asc}`}
                role="menuitem"
                className={`pa3 pointer flex items-center ${
                  currentSort.by === option.value &&
                  (option.value === sorts.BY_ORIGINAL || currentSort.asc === option.asc)
                    ? 'fw5'
                    : ''
                }`}
                onClick={() => handleSortChange(option.value, option.asc)}
                style={{ transition: 'background-color 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span className="f6" style={{ color: 'var(--theme-text-primary)' }}>{option.label}</span>
              </button>
            ))}
          </div>
        </DropdownMenu>
      )}
    </div>
  )
}

SortDropdown.propTypes = {
  currentSort: PropTypes.shape({
    by: PropTypes.string.isRequired,
    asc: PropTypes.bool.isRequired
  }).isRequired,
  onSortChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

export default withTranslation('files')(SortDropdown)
