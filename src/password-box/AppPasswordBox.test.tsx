// @vitest-environment jsdom
import { act } from 'react'; import { createRoot, type Root } from 'react-dom/client'; import { afterEach, beforeEach, describe, expect, it } from 'vitest'; import { AppPasswordBox } from './AppPasswordBox'
describe('AppPasswordBox', () => { let host: HTMLDivElement; let root: Root; beforeEach(() => { host=document.createElement('div');document.body.append(host);root=createRoot(host) }); afterEach(()=>{act(()=>root.unmount());host.remove()})
it('reveals and hides the password',()=>{act(()=>root.render(<AppPasswordBox defaultValue="secret"/>));const input=host.querySelector('input')!;expect(input.type).toBe('password');act(()=>host.querySelector('button')!.click());expect(input.type).toBe('text');expect(host.querySelector('button')!.getAttribute('aria-pressed')).toBe('true')})
it('renders strength content',()=>{act(()=>root.render(<AppPasswordBox strength={<span>Strong</span>}/>));expect(host.textContent).toContain('Strong')}) })
