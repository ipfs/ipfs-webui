import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ThemeSelector from './ThemeSelector.js'
import { ThemeProvider } from '../../contexts/theme-context.js'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n.js'

describe('ThemeSelector', () => {
  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      </I18nextProvider>
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })
})
