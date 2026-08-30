import type { ColumnPinningState, RowSelectionState, SortingState } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { AppButton, AppEmptyState, AppSegmentedControl, AppSelect, AppToggleSwitch, AppToolbar, useAppContextMenu, useAppToast } from '../../../../src'
import { AppDataTable, AppDataView, AppSelectionBar, type AppDataTableProps } from '../../../../src/data'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { tableRows, type DemoRow } from '../../fixtures/tableRows'
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
  const [heightMode, setHeightMode] = useState<'auto' | 'fixed' | 'fill'>('auto')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('multiple')
  const [pagination, setPagination] = useState(true)
  const [virtualized, setVirtualized] = useState(false)
  const [stickyCategory, setStickyCategory] = useState(true)
  const [pinCategory, setPinCategory] = useState(false)
  const columnPinning = useMemo<ColumnPinningState>(
    () => (pinCategory ? { left: ['category'] } : {}),
    [pinCategory],
  )
  const count = Object.values(selection).filter(Boolean).length
  const columns = useMemo(() => createColumns(t), [t])
  const tableControls = useMemo(() => createTableControls(t), [t])
  const handleRowContextMenu = useCallback<
    NonNullable<AppDataTableProps<DemoRow>['onRowContextMenu']>
  >(
    (row, event) => {
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
    },
    [contextMenu, t, toast],
  )

  const handleHeightModeChange = (next: 'auto' | 'fixed' | 'fill') => {
    setHeightMode(next)
    if (next === 'auto') setVirtualized(false)
  }

  const handleStickyCategoryChange = (next: boolean) => {
    setStickyCategory(next)
    if (next) setPinCategory(false)
  }

  const handlePinCategoryChange = (next: boolean) => {
    setPinCategory(next)
    if (next) setStickyCategory(false)
  }

  const tableClassName = heightMode === 'fill'
    ? 'demo-table-fill'
    : heightMode === 'fixed'
      ? 'demo-table-fixed'
      : ''

  return (
    <DemoPage
      className={heightMode === 'fill' ? 'demo-page--fill demo-data-table-page' : ''}
      pageLayout={heightMode === 'fill' ? 'fill' : 'flow'}
    >
      <DemoSection
        title="Complete data table"
        description="Compose page actions, selection actions, built-in search and filters, table interactions, and summary content in one data surface."
      >
        <DemoControls>
          <AppToggleSwitch checked={sticky} label={t('Sticky header')} onCheckedChange={setSticky} size="compact" />
          <AppToggleSwitch checked={resizing} label={t('Column resizing')} onCheckedChange={setResizing} size="compact" />
          <AppToggleSwitch checked={stickyCategory} label={t('Sticky Category column')} onCheckedChange={handleStickyCategoryChange} size="compact" />
          <AppToggleSwitch checked={pinCategory} label={t('Pin Category column')} onCheckedChange={handlePinCategoryChange} size="compact" />
          <span>{t('Table height')}</span>
          <AppSegmentedControl
            ariaLabel={t('Table height')}
            onValueChange={(value) => {
              if (value === 'auto' || value === 'fixed' || value === 'fill') {
                handleHeightModeChange(value)
              }
            }}
            options={[
              { value: 'auto', label: t('Automatic') },
              { value: 'fixed', label: t('Fixed height') },
              { value: 'fill', label: t('Fill remaining height') },
            ]}
            size="compact"
            value={heightMode}
          />
          <span>{t('Table density')}</span>
          <AppSelect
            aria-label={t('Table density')}
            onValueChange={(value) => {
              if (value === 'comfortable' || value === 'compact') setDensity(value)
            }}
            options={[
              { value: 'comfortable', label: t('Comfortable') },
              { value: 'compact', label: t('Compact') },
            ]}
            size="compact"
            value={density}
          />
          <span>{t('Selection mode')}</span>
          <AppSegmentedControl
            ariaLabel={t('Selection mode')}
            onValueChange={(value) => {
              if (value === 'single' || value === 'multiple') {
                setSelection({})
                setSelectionMode(value)
              }
            }}
            options={[
              { value: 'single', label: t('Single') },
              { value: 'multiple', label: t('Multiple') },
            ]}
            size="compact"
            value={selectionMode}
          />
          <AppToggleSwitch checked={pagination} label={t('Pagination')} onCheckedChange={setPagination} size="compact" />
          <AppToggleSwitch checked={virtualized} disabled={heightMode === 'auto'} label={t('Vertical virtualization')} onCheckedChange={setVirtualized} size="compact" />
          <span>{t('Right-click a data row for row-specific actions')}</span>
        </DemoControls>
        <AppDataView
          className={`demo-table-layout ${tableClassName}`.trim()}
          height={heightMode === 'auto' ? 'auto' : 'fill'}
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
            emptyContent={
              <AppEmptyState
                description={t('Try changing or clearing the current search and filters.')}
                layout="fill"
                title={t('No matching items')}
                visual="simple"
              />
            }
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
            onRowContextMenu={handleRowContextMenu}
            rowSelection={{
              value: selection,
              onChange: setSelection,
              mode: selectionMode,
              selectAllMode: 'page',
            }}
            cellSelection
            stickyHeader={sticky}
            stickyColumns={stickyCategory ? ['category'] : undefined}
            columnPinning={columnPinning}
            enableColumnResizing={resizing}
            density={density}
            virtualization={virtualized ? { overscan: 5 } : false}
          />
        </AppDataView>
      </DemoSection>
    </DemoPage>
  )
}

export function AppSelectionBarPage() {
  const t = useDemoCopy()
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
