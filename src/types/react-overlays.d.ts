declare module 'react-overlays' {
  import * as React from 'react'
  export interface ModalProps {
    show?: boolean
    className?: string
    renderBackdrop?: (props: any) => React.ReactNode
    onKeyDown?: (e: React.KeyboardEvent) => void
    onBackdropClick?: () => void
    [key: string]: unknown
  }
  export class Modal extends React.Component<ModalProps> {}
}
