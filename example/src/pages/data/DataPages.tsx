import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Button, Switch } from 'antd'
import { useState } from 'react'
import { AppToolbar } from '../../../../src'
import { AppDataTable, AppDataView, AppSelectionBar } from '../../../../src/data'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { tableRows } from '../../fixtures/tableRows'
import { columns, tableControls } from './tableConfig'

export function AppDataTablePage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sticky, setSticky] = useState(true)
  const [resizing, setResizing] = useState(true)
  const [fixedHeight, setFixedHeight] = useState(true)
  const [fill, setFill] = useState(false)
  const [pagination, setPagination] = useState(true)
  const count = Object.values(selection).filter(Boolean).length

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

  return (
    <DemoPage className={fill ? 'demo-page--fill' : ''}>
      <DemoControls>
        <span>
          <Switch checked={sticky} onChange={setSticky} /> Sticky header
        </span>
        <span>
          <Switch checked={resizing} onChange={setResizing} /> Column resizing
        </span>
        <span>
          <Switch checked={fixedHeight} onChange={handleFixedHeightChange} /> Fixed height
        </span>
        <span>
          <Switch checked={fill} onChange={handleFillChange} /> Fill remaining height
        </span>
        <span>
          <Switch checked={pagination} onChange={setPagination} /> Pagination
        </span>
      </DemoControls>
      <DemoSection
        title="Complete data table"
        description="Compose page actions, selection actions, built-in search and filters, table interactions, and summary content in one data surface."
      >
        <AppDataView
          className={`demo-table-layout ${tableClassName}`.trim()}
          height={fill || fixedHeight ? 'fill' : 'auto'}
          toolbar={
            <AppToolbar
              appearance="flat"
              start={<strong>Workspace items</strong>}
              status={<span>{tableRows.length} rows</span>}
              end={
                <>
                  <Button>Refresh</Button>
                  <Button type="primary">Add item</Button>
                </>
              }
            />
          }
          selectionBar={
            count > 0 ? (
              <AppSelectionBar
                count={count}
                label={`${count} selected`}
                onClear={() => setSelection({})}
                actions={
                  <>
                    <Button>Archive</Button>
                    <Button danger>Delete</Button>
                  </>
                }
              />
            ) : null
          }
        >
          <AppDataTable
            columns={columns}
            controls={tableControls}
            data={tableRows}
            getRowId={(row) => row.id}
            pagination={
              pagination
                ? {
                    defaultValue: { pageIndex: 0, pageSize: 10 },
                    pageSizeOptions: [5, 10, 20],
                  }
                : undefined
            }
            sorting={sorting}
            onSortingChange={setSorting}
            selection={{
              value: selection,
              onChange: setSelection,
              selectAllMode: 'page',
              getRowAriaLabel: (row) => `Select ${row.original.name}`,
            }}
            stickyHeader={sticky}
            enableColumnResizing={resizing}
          />
        </AppDataView>
      </DemoSection>
    </DemoPage>
  )
}

export function AppSelectionBarPage() {
  const [count, setCount] = useState(3)
  const [disabled, setDisabled] = useState(false)

  return (
    <DemoPage>
      <DemoControls>
        <Button onClick={() => setCount((value) => value + 1)}>Increase count</Button>
        <Button
          disabled={count === 0}
          onClick={() => setCount((value) => Math.max(0, value - 1))}
        >
          Decrease count
        </Button>
        <span>
          <Switch checked={disabled} onChange={setDisabled} /> Disabled actions
        </span>
      </DemoControls>
      <DemoSection title="Selection actions">
        <DemoPreview className="demo-selection-bar-preview">
          <div className="demo-selection-bar-stage">
            {count > 0 ? (
              <AppSelectionBar
                count={count}
                label={`${count} items selected`}
                onClear={() => setCount(0)}
                actions={
                  <>
                    <Button disabled={disabled}>Primary action</Button>
                    <Button danger disabled={disabled}>
                      Remove
                    </Button>
                  </>
                }
              />
            ) : (
              <span>Selection cleared. Increase the count to restore the bar.</span>
            )}
          </div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
