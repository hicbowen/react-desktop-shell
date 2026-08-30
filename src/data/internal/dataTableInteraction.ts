const interactiveSelector = [
  'a',
  'button',
  'input',
  'label',
  'select',
  'textarea',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="switch"]',
  '[role="textbox"]',
].join(',')

export function isDataTableInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(interactiveSelector) !== null
}
