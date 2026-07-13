import { useMemo, useState } from 'react'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Button, Input, Switch } from 'antd'
import { AppToolbar } from '../../../../src'
import { AppDataTable, AppDataView, AppSelectionBar } from '../../../../src/data'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { tableRows } from '../../fixtures/tableRows'
import { columns } from './tableConfig'

export function AppDataTablePage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sticky, setSticky] = useState(true)
  const [resizing, setResizing] = useState(true)
  const [fixedHeight, setFixedHeight] = useState(true)
  const [fill, setFill] = useState(false)
  const handleFixedHeightChange = (next: boolean) => {
    setFixedHeight(next)
    if (next) setFill(false)
  }
  const handleFillChange = (next: boolean) => {
    setFill(next)
    if (next) setFixedHeight(false)
  }
  const tableClassName = fill
    ? 'demo-table-fill'
    : fixedHeight
      ? 'demo-table-fixed'
      : ''
  return <DemoPage className={fill ? 'demo-page--fill' : ''}><DemoControls><span><Switch checked={sticky} onChange={setSticky} /> Sticky header</span><span><Switch checked={resizing} onChange={setResizing} /> Column resizing</span><span><Switch checked={fixedHeight} onChange={handleFixedHeightChange} /> Fixed height</span><span><Switch checked={fill} onChange={handleFillChange} /> Fill remaining height</span></DemoControls><DemoSection title="Interactive table" description="Choose natural height, a fixed 390px viewport, or a table that fills the remaining page height."><div className={tableClassName}><AppDataTable columns={columns} data={tableRows} getRowId={(row) => row.id} sorting={sorting} onSortingChange={setSorting} selection={{ value: selection, onChange: setSelection, getRowAriaLabel: (row) => `Select ${row.original.name}` }} stickyHeader={sticky} enableColumnResizing={resizing} /></div></DemoSection></DemoPage>
}

export function AppDataViewPage() {
  const [query, setQuery] = useState('')
  const [selection, setSelection] = useState<RowSelectionState>({})
  const rows = useMemo(() => tableRows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase())), [query])
  const count = Object.values(selection).filter(Boolean).length
  return <DemoPage><DemoSection title="Composed data surface" description="A minimal toolbar, table, conditional selection bar, and footer demonstrate AppDataView's layout role."><AppDataView toolbar={<AppToolbar start={<Input allowClear placeholder="Filter rows" value={query} onChange={(event) => setQuery(event.target.value)} />} status={<span>{rows.length} rows</span>} end={<Button type="primary">Add item</Button>} />} selectionBar={count > 0 ? <AppSelectionBar count={count} label={`${count} selected`} onClear={() => setSelection({})} actions={<Button>Apply action</Button>} /> : null} footer={<span>Showing {rows.length} neutral fixture rows</span>}><AppDataTable columns={columns} data={rows} getRowId={(row) => row.id} selection={{ value: selection, onChange: setSelection }} maxHeight={360} stickyHeader /></AppDataView></DemoSection></DemoPage>
}

export function AppSelectionBarPage() {
  const [count, setCount] = useState(3)
  const [disabled, setDisabled] = useState(false)
  return <DemoPage><DemoControls><Button onClick={() => setCount((value) => value + 1)}>Increase count</Button><Button disabled={count === 0} onClick={() => setCount((value) => Math.max(0, value - 1))}>Decrease count</Button><span><Switch checked={disabled} onChange={setDisabled} /> Disabled actions</span></DemoControls><DemoSection title="Selection actions"><DemoPreview className="demo-selection-bar-preview"><div className="demo-selection-bar-stage">{count > 0 ? <AppSelectionBar count={count} label={`${count} items selected`} onClear={() => setCount(0)} actions={<><Button disabled={disabled}>Primary action</Button><Button danger disabled={disabled}>Remove</Button></>} /> : <span>Selection cleared. Increase the count to restore the bar.</span>}</div></DemoPreview></DemoSection></DemoPage>
}
