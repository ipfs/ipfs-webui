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
      label: t('sortByName')
    },
    {
      value: sorts.BY_PINNED,
      label: t('sortByPinned')
    },
    {
      value: sorts.BY_ORIGINAL,
      label: t('sortByOriginal')
    }
  ]

  const handleSortChange = (sortValue) => {
    onSortChange(sortValue, true)
    setIsOpen(false)
  }

  const getCurrentLabel = () => {
    const option = sortOptions.find(opt => opt.value === currentSort.by)
    return option?.label || t('sortByName')
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
        className="flex items-center justify-between pa2 bg-white ba b--light-gray br2 pointer hover-bg-near-white"
        style={{ minWidth: '140px' }}
        aria-label={t('sortFiles')}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="f6 charcoal">{getCurrentLabel()}</span>
        <span className="ml2 f6 gray">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <DropdownMenu
          open={isOpen}
          className="sans-serif br2 charcoal"
          boxShadow="rgba(105, 196, 205, 0.5) 0px 1px 10px 0px"
          width={200}
          arrowAlign="left"
          arrowMarginRight="20px"
          left="0"
          translateX="0"
          translateY="5px"
          onDismiss={() => setIsOpen(false)}
        >
          <div className="flex flex-column" role="menu">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                role="menuitem"
                className={`bg-animate hover-bg-near-white pa3 pointer flex items-center ${
                  currentSort.by === option.value ? 'bg-near-white fw5' : ''
                }`}
                onClick={() => handleSortChange(option.value)}
              >
                <span className="f6 charcoal">{option.label}</span>
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
