declare module 'react-identicons' {
  import { FC } from 'react'
  
  interface ReactIdenticonProps {
    string: string
    size?: number
    palette?: string[]
    className?: string
  }
  
  const ReactIdenticon: FC<ReactIdenticonProps>
  export default ReactIdenticon
}
