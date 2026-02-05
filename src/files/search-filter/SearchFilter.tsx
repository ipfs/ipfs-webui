import React, { useState, useCallback } from 'react'
import { withTranslation } from 'react-i18next'
import classnames from 'classnames'
import { TFunction } from 'i18next'

interface SearchFilterProps {
  initialValue?: string
  onFilterChange: (filter: string) => void
  filteredCount: number
  totalCount: number
  className?: string
}

const SearchFilter = ({ initialValue = '', onFilterChange, filteredCount, totalCount, t, className = '' }: SearchFilterProps & { t: TFunction }) => {
  const [filter, setFilter] = useState(initialValue)

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilter(value)
    onFilterChange(value)
  }, [onFilterChange])

  const clearFilter = useCallback(() => {
    setFilter('')
    onFilterChange('')
  }, [onFilterChange])

  return (
    <div className={classnames('flex items-center pa2 bg-snow-muted', className)}>
      <div className='flex items-center relative flex-auto'>
        <input
          className='input-reset ba b--black-20 pa2 db w-100 br1'
          type='text'
          placeholder={t('searchFiles')}
          value={filter}
          onChange={handleFilterChange}
          aria-label={t('searchFiles')}
        />
        {filter && (
          <button
            className='absolute bg-transparent bn pointer f5 gray flex items-center justify-center'
            style={{ right: '0.5rem', top: 0, bottom: 0 }}
            onClick={clearFilter}
            aria-label={t('clearSearch')}
            title={t('clearSearch')}
          >
            ✕
          </button>
        )}
      </div>
      {filter && (
        <div className='ml2 f6 charcoal-muted nowrap'>
          {filteredCount} / {totalCount}
        </div>
      )}
    </div>
  )
}

export default withTranslation('files')(SearchFilter)
