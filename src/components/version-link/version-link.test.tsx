import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import VersionLink from './version-link'
import { describe, it, expect } from '@jest/globals'

describe('VersionLink', () => {
  describe('when agentVersion is not provided', () => {
    it('should render "Unknown" text', () => {
      // @ts-expect-error - agentVersion is not provided
      render(<VersionLink />)
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should render "Unknown" text when agentVersion is null', () => {
      // @ts-expect-error - agentVersion is not allowed to be null
      render(<VersionLink agentVersion={null} />)
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should render "Unknown" text when agentVersion is undefined', () => {
      // @ts-expect-error - agentVersion is not allowed to be undefined
      render(<VersionLink agentVersion={undefined} />)
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should render "Unknown" text when agentVersion is empty string', () => {
      render(<VersionLink agentVersion="" />)
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
  })

  describe('when agentVersion is provided', () => {
    describe('with kubo agent (supported provider)', () => {
      it('should render kubo with version and create links', () => {
        render(<VersionLink agentVersion="/kubo/0.14.0/desktop" />)

        // Check that the name link exists
        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()
        expect(nameLink).toHaveAttribute('href', 'https://github.com/ipfs/kubo')
        expect(nameLink).toHaveAttribute('target', '_blank')
        expect(nameLink).toHaveAttribute('rel', 'noopener noreferrer')
        expect(nameLink).toHaveClass('link', 'blue')

        // Check that the version link exists
        const versionLink = screen.getByRole('link', { name: 'v0.14.0' })
        expect(versionLink).toBeInTheDocument()
        expect(versionLink).toHaveAttribute('href', 'https://github.com/ipfs/kubo/releases/tag/v0.14.0')
        expect(versionLink).toHaveAttribute('target', '_blank')
        expect(versionLink).toHaveAttribute('rel', 'noopener noreferrer')
        expect(versionLink).toHaveClass('link', 'blue', 'ml2')

        // Check that the suffix is rendered
        expect(screen.getByText('desktop')).toBeInTheDocument()
      })

      it('should render kubo with version but no suffix', () => {
        render(<VersionLink agentVersion="/kubo/0.14.0" />)

        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()

        const versionLink = screen.getByRole('link', { name: 'v0.14.0' })
        expect(versionLink).toBeInTheDocument()

        // Should not have suffix text
        expect(screen.queryByText('desktop')).not.toBeInTheDocument()
      })

      it('should render kubo with version and multiple suffix parts', () => {
        render(<VersionLink agentVersion="/kubo/0.14.0/desktop/stable" />)

        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()

        const versionLink = screen.getByRole('link', { name: 'v0.14.0' })
        expect(versionLink).toBeInTheDocument()

        // Check that multiple suffix parts are joined
        expect(screen.getByText('desktop/stable')).toBeInTheDocument()
      })

      it('should handle kubo with no version', () => {
        render(<VersionLink agentVersion="/kubo" />)

        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()

        // Should not have version link
        expect(screen.queryByRole('link', { name: /v\d/ })).not.toBeInTheDocument()

        // Should not have suffix
        expect(screen.queryByText('desktop')).not.toBeInTheDocument()
      })

      it('should handle kubo with empty version part', () => {
        render(<VersionLink agentVersion="/kubo//desktop" />)

        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()

        // Should have version link with "desktop" as version since empty part is filtered out
        const versionLink = screen.getByRole('link', { name: /vdesktop/ })
        expect(versionLink).toBeInTheDocument()
        expect(versionLink).toHaveAttribute('href', 'https://github.com/ipfs/kubo/releases/tag/vdesktop')

        // Should not have separate suffix since "desktop" becomes the version
        expect(screen.queryByText('desktop')).not.toBeInTheDocument()
      })
    })

    describe('with unsupported agent', () => {
      it('should render unsupported agent name without link', () => {
        render(<VersionLink agentVersion="/go-ipfs/0.14.0/desktop" />)

        // Should render the name as text, not a link
        expect(screen.getByText(/go-ipfs/)).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'go-ipfs' })).not.toBeInTheDocument()

        // Should have version as text, not a link for unsupported agents
        expect(screen.getByText(/v0\.14\.0/)).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'v0.14.0' })).not.toBeInTheDocument()

        // Should have suffix
        expect(screen.getByText(/desktop/)).toBeInTheDocument()
      })

      it('should render unsupported agent with version but no suffix', () => {
        render(<VersionLink agentVersion="/go-ipfs/0.14.0" />)

        expect(screen.getByText(/go-ipfs/)).toBeInTheDocument()

        // Should have version as text, not a link for unsupported agents
        expect(screen.getByText(/v0\.14\.0/)).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'v0.14.0' })).not.toBeInTheDocument()

        // Should not have suffix
        expect(screen.queryByText('desktop')).not.toBeInTheDocument()
      })

      it('should handle unsupported agent with no version', () => {
        render(<VersionLink agentVersion="/go-ipfs" />)

        expect(screen.getByText(/go-ipfs/)).toBeInTheDocument()

        // Should not have version link
        expect(screen.queryByRole('link', { name: /v\d/ })).not.toBeInTheDocument()
      })
    })

    describe('with complex agent versions', () => {
      it('should handle agent version with multiple slashes and empty parts', () => {
        render(<VersionLink agentVersion="///kubo///0.14.0///desktop///" />)

        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()

        const versionLink = screen.getByRole('link', { name: 'v0.14.0' })
        expect(versionLink).toBeInTheDocument()

        // Should have suffix with multiple parts
        expect(screen.getByText(/desktop/)).toBeInTheDocument()
      })

      it('should handle agent version with special characters', () => {
        render(<VersionLink agentVersion="/kubo/0.14.0-rc1/desktop-beta" />)

        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()

        const versionLink = screen.getByRole('link', { name: 'v0.14.0-rc1' })
        expect(versionLink).toBeInTheDocument()

        expect(screen.getByText('desktop-beta')).toBeInTheDocument()
      })

      it('should handle agent version with only name', () => {
        render(<VersionLink agentVersion="/kubo" />)

        const nameLink = screen.getByRole('link', { name: 'kubo' })
        expect(nameLink).toBeInTheDocument()

        // Should not have version or suffix
        expect(screen.queryByRole('link', { name: /v\d/ })).not.toBeInTheDocument()
        expect(screen.queryByText(/desktop/)).not.toBeInTheDocument()
      })
    })
  })

  describe('ReleaseLink component', () => {
    it('should not render when version is not provided', () => {
      render(<VersionLink agentVersion="/kubo" />)

      expect(screen.queryByRole('link', { name: /v\d/ })).not.toBeInTheDocument()
    })

    it('should render version as text for unsupported agents', () => {
      render(<VersionLink agentVersion="/unsupported/1.2.3" />)

      // Should render version as text, not a link
      expect(screen.getByText(/v1\.2\.3/)).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'v1.2.3' })).not.toBeInTheDocument()
    })

    it('should render version as link for supported agents', () => {
      render(<VersionLink agentVersion="/kubo/1.2.3" />)

      const versionLink = screen.getByRole('link', { name: 'v1.2.3' })
      expect(versionLink).toBeInTheDocument()
      expect(versionLink).toHaveAttribute('href', 'https://github.com/ipfs/kubo/releases/tag/v1.2.3')
    })
  })

  describe('accessibility', () => {
    it('should have proper link attributes for external links', () => {
      render(<VersionLink agentVersion="/kubo/0.14.0/desktop" />)

      const nameLink = screen.getByRole('link', { name: 'kubo' })
      expect(nameLink).toHaveAttribute('target', '_blank')
      expect(nameLink).toHaveAttribute('rel', 'noopener noreferrer')

      const versionLink = screen.getByRole('link', { name: 'v0.14.0' })
      expect(versionLink).toHaveAttribute('target', '_blank')
      expect(versionLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should have proper CSS classes', () => {
      render(<VersionLink agentVersion="/kubo/0.14.0/desktop" />)

      const nameLink = screen.getByRole('link', { name: 'kubo' })
      expect(nameLink).toHaveClass('link', 'blue')

      const versionLink = screen.getByRole('link', { name: 'v0.14.0' })
      expect(versionLink).toHaveClass('link', 'blue', 'ml2')
    })
  })

  describe('edge cases', () => {
    it('should handle agent version with only slashes', () => {
      render(<VersionLink agentVersion="///" />)

      // Should render empty span since no valid parts after filtering
      const spans = screen.getAllByText('')
      expect(spans.length).toBeGreaterThan(0)
    })

    it('should handle agent version with spaces', () => {
      render(<VersionLink agentVersion="/kubo /0.14.0/desktop" />)

      // Should handle spaces in parts
      expect(screen.getByText(/kubo /)).toBeInTheDocument()
      expect(screen.getByText(/desktop/)).toBeInTheDocument()
    })

    it('should handle very long agent version strings', () => {
      const longVersion = `/kubo/0.14.0/${'a'.repeat(1000)}`
      render(<VersionLink agentVersion={longVersion} />)

      const nameLink = screen.getByRole('link', { name: 'kubo' })
      expect(nameLink).toBeInTheDocument()

      const versionLink = screen.getByRole('link', { name: 'v0.14.0' })
      expect(versionLink).toBeInTheDocument()

      // Should handle long suffix
      expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument()
    })
  })
})
