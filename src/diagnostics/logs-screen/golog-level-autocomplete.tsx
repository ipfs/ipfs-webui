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
  onSubmit?: (event?: React.FormEvent) => (Promise<void> | void)
  onValidityChange?: (isValid: boolean) => void
  onErrorChange?: (errorMessage: string) => void
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
  onSubmit,
  error,
  onValidityChange,
  onErrorChange
}) => {
  const { t } = useTranslation('diagnostics')
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [errorMessage, setErrorMessage] = useState(error || '')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setErrorMessage(error || '')
    // Update validity when error prop changes
    onValidityChange?.(!error)
    onErrorChange?.(error || '')
  }, [error, onValidityChange, onErrorChange])

  const validateGologLevel = useCallback((input: string): { isValid: boolean; errorMessage: string } => {
    if (input.trim().length === 0) {
      return { isValid: false, errorMessage: t('logs.autocomplete.invalidInput') }
    }

    const parts = input.split(',')
    const validLevels = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal']
    const validSubsystems = subsystems.map(s => s.name)

    let seenGlobalLevel = false

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      if (part.length === 0) continue

      if (part.includes('=')) {
        // This is a subsystem=level part
        const equalIndex = part.indexOf('=')
        const subsystemName = part.substring(0, equalIndex).trim()
        const level = part.substring(equalIndex + 1).trim()

        // Check if subsystem exists
        if (!validSubsystems.includes(subsystemName)) {
          return { isValid: false, errorMessage: t('logs.autocomplete.invalidSubsystem', { subsystem: subsystemName, subsystems: validSubsystems.join(', ') }) }
        }

        if (level.length === 0) {
          return { isValid: false, errorMessage: t('logs.autocomplete.invalidSubsystemLevel', { subsystem: subsystemName, subsystems: validSubsystems.join(', ') }) }
        }

        // Check if level is valid
        if (!validLevels.includes(level.toLowerCase())) {
          return { isValid: false, errorMessage: t('logs.autocomplete.invalidLevel', { level }) }
        }
      } else if (!seenGlobalLevel) {
        // This is a global level
        if (!validLevels.includes(part.toLowerCase())) {
          return { isValid: false, errorMessage: t('logs.autocomplete.invalidLevel', { level: part }) }
        }
        seenGlobalLevel = true
      } else {
        // we have already seen a global level, so they can't have another one.. if this is not a valid subsystem, then it's invalid
        if (validSubsystems.includes(part)) {
          // if it is a valid subsystem, then we need to display an error that they need to add an = and a level
          return { isValid: false, errorMessage: t('logs.autocomplete.invalidSubsystemLevel', { subsystem: part, subsystems: validSubsystems.join(', ') }) }
        }
        return { isValid: false, errorMessage: t('logs.autocomplete.invalidSubsystem', { subsystem: part, subsystems: validSubsystems.join(', ') }) }
      }
    }

    return { isValid: true, errorMessage: '' }
  }, [subsystems, t])

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

    // Check if the current part is complete
    let isComplete = false

    if (equalIndex > 0) {
      // This is a subsystem=level part
      const levelAfterEquals = currentPart.substring(equalIndex + 1).trim()
      const isValidLevel = LOG_LEVELS.some(level => level.toLowerCase() === levelAfterEquals.toLowerCase())
      isComplete = levelAfterEquals.length > 0 && isValidLevel
    } else {
      // This is a global level part
      const isValidGlobalLevel = LOG_LEVELS.some(level => level.toLowerCase() === currentPart.trim().toLowerCase())
      isComplete = currentPart.trim().length > 0 && isValidGlobalLevel
    }

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

    // Don't show suggestions if we're submitting, at the end of a complete part, or if the current part is complete
    if (isSubmitting || context.isAtEndOfCompletePart || context.isComplete) {
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
  }, [inputValue, cursorPosition, subsystems, parseInputContext, isSubmitting])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const newCursorPosition = e.target.selectionStart || 0

    setInputValue(newValue)
    setCursorPosition(newCursorPosition)
    setSelectedIndex(0)

    onChange(newValue)

    // Always validate on input change
    const validation = validateGologLevel(newValue)

    // Update validity state immediately
    if (!validation.isValid) {
      onValidityChange?.(false)
    } else {
      onValidityChange?.(true)
    }
  }, [onChange, validateGologLevel, onValidityChange])

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

    // Validate after suggestion selection
    const validation = validateGologLevel(newValue)
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage)
      onValidityChange?.(false)
    } else {
      setErrorMessage('')
      onValidityChange?.(true)
    }

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
  }, [inputValue, cursorPosition, onChange, parseInputContext, validateGologLevel, onValidityChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // If dropdown is open and we have suggestions, select the current suggestion
      if (isOpen && suggestions.length > 0) {
        if (suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        return
      }

      // Otherwise, submit the form
      if (onSubmit && !isSubmitting) {
        // Validate one more time before submitting
        const validation = validateGologLevel(inputValue)
        onValidityChange?.(validation.isValid)

        // Remove focus from input to close suggestions
        inputRef.current?.blur()
        setIsOpen(false)

        setIsSubmitting(true)
        try {
          await onSubmit(undefined)
        } catch (error: unknown) {
          // Handle submission error if needed
          console.error('Form submission error:', error)
          setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
        } finally {
          setIsSubmitting(false)
        }
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }, [isOpen, suggestions, selectedIndex, handleSuggestionSelect, onSubmit, isSubmitting, validateGologLevel, onValidityChange, inputValue])

  // Handle focus/blur
  const handleFocus = useCallback(() => {
    setIsFocused(true)

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
        setIsFocused(false)
        // Validate when losing focus
        const validation = validateGologLevel(inputValue)
        if (!validation.isValid) {
          setErrorMessage(validation.errorMessage)
          onValidityChange?.(false)
        } else {
          setErrorMessage('')
          onValidityChange?.(true)
        }
      }
    }, 150)
  }, [isTransitioning, validateGologLevel, inputValue, onValidityChange])

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

  // Handle dropdown state based on suggestions
  useEffect(() => {
    const context = parseInputContext(inputValue, cursorPosition)

    // Don't show suggestions if we're submitting, at the end of a complete part, or if the current part is complete
    if (isSubmitting || context.isAtEndOfCompletePart || context.isComplete) {
      setIsOpen(false)
    } else {
      // Only open dropdown if there are suggestions available AND the component has focus
      setIsOpen(suggestions.length > 0 && isFocused)
    }
  }, [inputValue, cursorPosition, suggestions.length, parseInputContext, isFocused, isSubmitting])

  // Handle error message display based on suggestions and validation
  useEffect(() => {
    // If error prop is provided, use it (external error takes precedence)
    if (error) {
      setErrorMessage(error)
      onErrorChange?.(error)
      return
    }

    const validation = validateGologLevel(inputValue)
    const hasSuggestions = suggestions.length > 0

    // Only show error if not focused, or if focused but no suggestions available
    const shouldShowError = !isFocused || (isFocused && !hasSuggestions)

    if (!validation.isValid && shouldShowError) {
      setErrorMessage(validation.errorMessage)
      onErrorChange?.(validation.errorMessage)
    } else if (validation.isValid) {
      setErrorMessage('')
      onErrorChange?.('')
    }
  }, [inputValue, suggestions.length, validateGologLevel, isFocused, error, onErrorChange])

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
        className={`input-reset ba pa2 bg-light-gray f6 w-100 ${errorMessage ? 'b--red-muted focus-outline-red' : 'b--black-20'}`}
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
              className={`z-999 pa2 pointer hover-bg-light-gray ${index === selectedIndex ? 'bg-light-blue' : ''}`}
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
      {/* {errorMessage && showInternalError && (
        <div className="absolute top-100 left-0 f6 red pa2 z-888 mw2 mw6-l mw6-m">
          {errorMessage}
        </div>
      )} */}
    </div>
  )
}
