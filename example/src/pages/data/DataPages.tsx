import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import { AppButton, AppToggleSwitch, AppToolbar, useAppContextMenu, useAppToast } from '../../../../src'
import { AppDataTable, AppDataView, AppSelectionBar } from '../../../../src/data'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { tableRows } from '../../fixtures/tableRows'
import { useDemoCopy } from '../../i18n/interactiveTranslations'
import { createColumns, createTableControls, localizeTableValue } from './tableConfig'

export function AppDataTablePage() {
  const contextMenu = useAppContextMenu()
  const toast = useAppToast()
  const t = useDemoCopy()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sticky, setSticky] = useState(true)
  const [resizing, setResizing] = useState(true)
  const [fixedHeight, setFixedHeight] = useState(true)
  const [fill, setFill] = useState(false)
  const [pagination, setPagination] = useState(true)
  const [virtualized, setVirtualized] = useState(false)
  const [stickyCategory, setStickyCategory] = useState(true)
  const count = Object.values(selection).filter(Boolean).length
  const columns = createColumns(t)
  const tableControls = createTableControls(t)

  const handleFixedHeightChange = (next: boolean) => {
    setFixedHeight(next)
    if (next) setFill(false)
    if (!next && !fill) setVirtualized(false)
  }

  const handleFillChange = (next: boolean) => {
    setFill(next)
    if (next) setFixedHeight(false)
    if (!next && !fixedHeight) setVirtualized(false)
  }

  const tableClassName = fill
    ? 'demo-table-fill'
    : fixedHeight
      ? 'demo-table-fixed'
      : ''

  return (
    <DemoPage className={fill ? 'demo-page--fill' : ''}>
      <DemoControls>
        <AppToggleSwitch checked={sticky} label={t('Sticky header')} onCheckedChange={setSticky} size="compact" />
        <AppToggleSwitch checked={resizing} label={t('Column resizing')} onCheckedChange={setResizing} size="compact" />
        <AppToggleSwitch checked={stickyCategory} label={t('Sticky Category column')} onCheckedChange={setStickyCategory} size="compact" />
        <AppToggleSwitch checked={fixedHeight} label={t('Fixed height')} onCheckedChange={handleFixedHeightChange} size="compact" />
        <AppToggleSwitch checked={fill} label={t('Fill remaining height')} onCheckedChange={handleFillChange} size="compact" />
        <AppToggleSwitch checked={pagination} label={t('Pagination')} onCheckedChange={setPagination} size="compact" />
        <AppToggleSwitch checked={virtualized} disabled={!fill && !fixedHeight} label={t('Vertical virtualization')} onCheckedChange={setVirtualized} size="compact" />
        <span>{t('Right-click a data row for row-specific actions')}</span>
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
              start={<strong>{t('Workspace items')}</strong>}
              status={<span>{tableRows.length} {t('rows')}</span>}
              end={
                <>
                  <AppButton>{t('Refresh')}</AppButton>
                  <AppButton appearance="primary">{t('Add item')}</AppButton>
                </>
              }
            />
          }
          selectionBar={
            count > 0 ? (
              <AppSelectionBar
                count={count}
                label={`${count} ${t('selected')}`}
                onClear={() => setSelection({})}
                actions={
                  <>
                    <AppButton>{t('Archive')}</AppButton>
                    <AppButton appearance="danger">{t('Delete')}</AppButton>
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
            onRowContextMenu={(row, event) => {
              event.preventDefault()
              const rowName = localizeTableValue(t, row.original.name)
              contextMenu.open({
                items: [
                  {
                    key: 'open',
                    label: `${t('Open row')} ${rowName}`,
                    onClick: () => toast.info(`${t('Opened row')} ${rowName}`),
                  },
                  {
                    key: 'archive',
                    label: t('Archive'),
                    disabled: row.original.status === 'Processing',
                    onClick: () => toast.info(`${t('Archived row')} ${rowName}`),
                  },
                  { type: 'separator' },
                  {
                    key: 'delete',
                    label: t('Delete'),
                    danger: true,
                    onClick: () => toast.info(`${t('Delete row')} ${rowName}`),
                  },
                ],
                x: event.clientX,
                y: event.clientY,
                trigger: event.currentTarget,
              })
            }}
            selection={{
              value: selection,
              onChange: setSelection,
              selectAllMode: 'page',
            }}
            stickyHeader={sticky}
            stickyColumns={stickyCategory ? ['category'] : undefined}
            enableColumnResizing={resizing}
            virtualization={virtualized ? { overscan: 5 } : false}
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
        <AppButton onClick={() => setCount((value) => value + 1)}>Increase count</AppButton>
        <AppButton
          disabled={count === 0}
          onClick={() => setCount((value) => Math.max(0, value - 1))}
        >
          Decrease count
        </AppButton>
        <AppToggleSwitch checked={disabled} label="Disabled actions" onCheckedChange={setDisabled} size="compact" />
      </DemoControls>
      <DemoSection title="Selection actions">
        <DemoPreview className="demo-selection-bar-preview">
          <div className="demo-selection-bar-stage">
            {count > 0 ? (
              <AppSelectionBar
                count={count}
                label={`${count} ${t('items selected')}`}
                onClear={() => setCount(0)}
                actions={
                  <>
                    <AppButton disabled={disabled}>Primary action</AppButton>
                    <AppButton appearance="danger" disabled={disabled}>
                      Remove
                    </AppButton>
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
