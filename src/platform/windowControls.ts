export type WindowControls = {
  minimizeWindow: () => void
  toggleMaximizeWindow: () => void
  closeWindow: () => void
}

const noop = () => {
  // Browser/Vite preview fallback. Replace these methods with Wails runtime calls.
}

export const windowControls: WindowControls = {
  minimizeWindow: noop,
  toggleMaximizeWindow: noop,
  closeWindow: noop,
}
