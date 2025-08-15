import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface LogSubsystem {
  name: string
  level: string
}

interface GologLevelAutocompleteProps {
  value: string
  onChange: (value: string) => void
  subsystems: LogSubsystem[]
  disabled?: boolean
  placeholder?: string
  className?: string
  error?: string
}

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal']

export const GologLevelAutocomplete: React.FC<GologLevelAutocompleteProps> = ({
  value,
  onChange,
  subsystems,
  disabled = false,
  placeholder = '',
  className = '',
  error = ''
}) => {
  const { t } = useTranslation('diagnostics')
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse current input to understand context
  const parseInputContext = useCallback((input: string, cursorPos: number) => {
    const parts = input.split(',')
    let currentPartIndex = 0
    let currentPartStart = 0

    // Find which part the cursor is in
    for (let i = 0; i < parts.length; i++) {
      const partEnd = currentPartStart + parts[i].length
      if (cursorPos <= partEnd) {
        currentPartIndex = i
        break
      }
      currentPartStart = partEnd + 1 // +1 for the comma
    }

    const currentPart = parts[currentPartIndex] || ''
    const beforeCursor = input.substring(0, cursorPos)
    const afterCursor = input.substring(cursorPos)

    // Check if we're in a subsystem=level part
    const equalIndex = currentPart.indexOf('=')
    const isInSubsystemPart = equalIndex > 0 && cursorPos > currentPartStart + equalIndex

    // Check if the current part is complete (has subsystem=level)
    // Only consider complete if there's a valid log level after the equals sign
    const levelAfterEquals = currentPart.substring(equalIndex + 1).trim()
    const isValidLevel = LOG_LEVELS.some(level => level.toLowerCase() === levelAfterEquals.toLowerCase())
    const isComplete = equalIndex > 0 && levelAfterEquals.length > 0 && isValidLevel

    // Check if cursor is at the end of a complete part (ready for comma)
    const isAtEndOfCompletePart = isComplete && cursorPos === currentPartStart + currentPart.length

    return {
      currentPartIndex,
      currentPart,
      beforeCursor,
      afterCursor,
      isInSubsystemPart,
      equalIndex,
      isComplete,
      isAtEndOfCompletePart
    }
  }, [])

  // Generate suggestions based on current context
  const suggestions = useMemo(() => {
    const context = parseInputContext(inputValue, cursorPosition)
    const suggestions: Array<{ text: string; type: 'global' | 'subsystem' | 'level' }> = []

    // Don't show suggestions if we're at the end of a complete part (ready for comma)
    if (context.isAtEndOfCompletePart) {
      return []
    }

    // Additional check: if the current part is complete and cursor is at the end, don't show suggestions
    if (context.isComplete && cursorPosition === inputValue.length) {
      return []
    }

    // Check if we're at the end of the input and the last part is complete
    if (cursorPosition === inputValue.length) {
      const parts = inputValue.split(',')
      const lastPart = parts[parts.length - 1].trim()
      if (lastPart.includes('=') && lastPart.substring(lastPart.indexOf('=') + 1).trim().length > 0) {
        // Only return empty if it's a valid complete level
        const levelAfterEquals = lastPart.substring(lastPart.indexOf('=') + 1).trim()
        const isValidLevel = LOG_LEVELS.some(level => level.toLowerCase() === levelAfterEquals.toLowerCase())
        if (isValidLevel) {
          return []
        }
      }
    }

    // Get all existing subsystems from the input to avoid duplicates
    const existingSubsystems = new Set<string>()
    const parts = inputValue.split(',')
    parts.forEach(part => {
      const trimmedPart = part.trim()
      if (trimmedPart.includes('=')) {
        const subsystemName = trimmedPart.substring(0, trimmedPart.indexOf('=')).trim()
        existingSubsystems.add(subsystemName)
      }
    })

    if (context.currentPartIndex === 0) {
      // First part - suggest global levels
      LOG_LEVELS.forEach(level => {
        if (level.toLowerCase().includes(context.currentPart.toLowerCase())) {
          suggestions.push({ text: level, type: 'global' })
        }
      })
    } else {
      // Subsequent parts - suggest subsystems and levels
      const currentPart = context.currentPart.trim()
      const hasEquals = currentPart.includes('=')

      if (!hasEquals) {
        // No equals sign yet - suggest subsystems only (excluding already used ones)
        subsystems.forEach(subsystem => {
          if (subsystem.name.toLowerCase().includes(currentPart.toLowerCase()) &&
              !existingSubsystems.has(subsystem.name)) {
            suggestions.push({ text: subsystem.name, type: 'subsystem' })
          }
        })
      } else {
        // Has equals sign - suggest levels for the current subsystem
        const equalIndex = currentPart.indexOf('=')
        const levelInput = currentPart.substring(equalIndex + 1).trim()

        LOG_LEVELS.forEach(level => {
          if (level.toLowerCase().includes(levelInput.toLowerCase())) {
            suggestions.push({ text: level, type: 'level' })
          }
        })
      }
    }

    return suggestions // Show all suggestions without limit
  }, [inputValue, cursorPosition, subsystems, parseInputContext])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const newCursorPosition = e.target.selectionStart || 0

    setInputValue(newValue)
    setCursorPosition(newCursorPosition)
    setSelectedIndex(0)

    // Check if we should show suggestions based on the new cursor position
    const context = parseInputContext(newValue, newCursorPosition)

    // Don't show suggestions if we're at the end of a complete part
    if (context.isAtEndOfCompletePart) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }

    onChange(newValue)
  }, [onChange, parseInputContext])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: { text: string; type: string }) => {
    const context = parseInputContext(inputValue, cursorPosition)
    const parts = inputValue.split(',')

    if (context.currentPartIndex === 0) {
      // Replace global level
      parts[0] = suggestion.text
    } else {
      // Handle subsystem/level selection
      const currentPart = context.currentPart.trim()
      const hasEquals = currentPart.includes('=')

      if (suggestion.type === 'subsystem' && !hasEquals) {
        // Selecting a subsystem - add equals sign to allow level input
        parts[context.currentPartIndex] = suggestion.text + '='
      } else if (suggestion.type === 'level' && hasEquals) {
        // Selecting a level - complete the subsystem=level
        const equalIndex = currentPart.indexOf('=')
        const subsystemName = currentPart.substring(0, equalIndex).trim()
        parts[context.currentPartIndex] = subsystemName + '=' + suggestion.text
      } else {
        // Fallback - just replace the part
        parts[context.currentPartIndex] = suggestion.text
      }
    }

    const newValue = parts.join(',')
    setInputValue(newValue)
    onChange(newValue)

    // Don't close dropdown if we just added an equals sign
    if (suggestion.type === 'subsystem' && !context.currentPart.includes('=')) {
      // Keep dropdown open and position cursor after equals sign
      const newCursorPos = newValue.lastIndexOf('=') + 1
      setIsTransitioning(true)
      setCursorPosition(newCursorPos)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
        setIsTransitioning(false)
      }, 10)
    } else {
      setIsOpen(false)
      // Focus back to input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.setSelectionRange(newValue.length, newValue.length)
        }
      }, 0)
    }
  }, [inputValue, cursorPosition, onChange, parseInputContext])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }, [isOpen, suggestions, selectedIndex, handleSuggestionSelect])

  // Handle focus/blur
  const handleFocus = useCallback(() => {
    // Set cursor to end of input when focused
    setTimeout(() => {
      if (inputRef.current) {
        const endPosition = inputValue.length
        inputRef.current.setSelectionRange(endPosition, endPosition)
        setCursorPosition(endPosition)
      }
    }, 0)

    // Check if we should show suggestions based on current context
    const context = parseInputContext(inputValue, inputValue.length)

    // Don't show dropdown if we're at the end of a complete part
    if (context.isAtEndOfCompletePart) {
      setIsOpen(false)
      return
    }

    // Only open dropdown if there are actual suggestions to show
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }, [suggestions.length, inputValue, parseInputContext])

  const handleBlur = useCallback(() => {
    // Don't close if we're in the middle of a transition
    if (isTransitioning) {
      return
    }

    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      // Only close if we're not in the middle of updating cursor position
      if (!inputRef.current?.matches(':focus')) {
        setIsOpen(false)
      }
    }, 150)
  }, [isTransitioning])

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Update cursor position when input is focused
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, [cursorPosition])

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`input-reset ba pa2 bg-light-gray f6 w-100 ${error ? 'b--red-muted focus-outline-red' : 'b--black-20'}`}
        style={{
          fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      />

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-100 left-0 right-0 bg-white ba b--black-20 shadow-2 z-999 max-h5 overflow-auto"
          style={{ maxHeight: '200px' }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.text}-${index}`}
              className={`pa2 pointer hover-bg-light-gray ${index === selectedIndex ? 'bg-light-blue' : ''}`}
              onClick={() => handleSuggestionSelect(suggestion)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSuggestionSelect(suggestion)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span className="f6">
                {suggestion.text}
              </span>
              <span className="ml2 f7 gray">
                {suggestion.type === 'global' && t('logs.autocomplete.globalLevel')}
                {suggestion.type === 'subsystem' && t('logs.autocomplete.subsystem')}
                {suggestion.type === 'level' && t('logs.autocomplete.level')}
              </span>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="mt2 f6 red">
          {error}
        </div>
      )}
    </div>
  )
}
