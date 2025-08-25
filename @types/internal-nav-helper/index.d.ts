declare module 'internal-nav-helper' {
  export function getNavHelper(onInternalNav: (path: string) => void): (e: MouseEvent) => void
  export function findAnchorTag(el: HTMLElement): HTMLElement | null
}
