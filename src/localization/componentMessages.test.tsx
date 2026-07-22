// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppAutoComplete } from '../auto-complete'
import { AppBreadcrumbBar } from '../breadcrumb-bar'
import { AppCommandPalette } from '../command-palette'
import { AppMenuBar } from '../menu-bar'
import { AppPropertyGrid } from '../property-grid'
import { AppResizablePaneGroup } from '../resizable-pane'
import { AppShell } from '../shell/AppShell'
import { AppStatusBar } from '../status-bar'
import { AppTabView } from '../tab-view'
import { AppTaskIndicator } from '../task-center'
import { AppTreeView } from '../tree-view'

describe('localized component defaults', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  it('uses Chinese defaults across remaining library components', () => {
    const reset = vi.fn()
    act(() => root.render(
      <AppShell locale="zh-CN">
        <AppBreadcrumbBar items={[{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]} maxVisibleItems={1} />
        <AppMenuBar menus={[]} />
        <AppStatusBar />
        <AppCommandPalette commands={[]} onOpenChange={vi.fn()} open />
        <AppAutoComplete defaultOpen options={[]} />
        <AppPropertyGrid groups={[{ key: 'general', label: 'General', items: [{ key: 'name', label: 'Name', editor: <input />, modified: true, onReset: reset }] }]} />
        <AppResizablePaneGroup><div>Primary</div><div>Secondary</div></AppResizablePaneGroup>
        <AppTreeView items={[{ key: 'folder', label: 'Folder', hasChildren: true }]} />
        <AppTabView items={[{ key: 'one', label: 'One', content: 'Content', dirty: true }]} onAddTab={vi.fn()} />
        <AppTaskIndicator tasks={[{ id: 'task', title: 'Task', state: 'running' }]} />
      </AppShell>,
    ))

    expect(host.querySelector('[aria-label="面包屑导航"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="显示更早的位置"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="应用程序菜单"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="状态"]')).not.toBeNull()
    expect(document.body.querySelector('[aria-label="命令面板"]')).not.toBeNull()
    expect(document.body.querySelector<HTMLInputElement>('.app-command-palette__input')?.placeholder).toBe('输入命令')
    expect(document.body.textContent).toContain('没有匹配的命令')
    expect(host.textContent).toContain('没有建议')
    expect(host.querySelector('[aria-label="属性"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="已修改"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="调整属性名称列大小：Name"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="重置为默认值：Name"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="调整窗格大小"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="树视图"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="展开"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="文档"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="新建标签页"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="未保存"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="1 个活动任务"]')).not.toBeNull()
  })
})
