import { useState } from 'react'
import {
  Copy,
  Ellipsis,
  Pencil,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react'
import {
  AppMenuFlyout,
  AppToolbar,
  AppTooltip,
  type AppMenuFlyoutEntry,
} from '../../../../src'
import {
  DemoPage,
  DemoPreview,
  DemoSection,
} from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppMenuFlyoutPage() {
  const t = useDemoCopy()
  const commandItems: AppMenuFlyoutEntry[] = [{ key: 'refresh', label: t('Refresh'), icon: <RefreshCw /> }, { key: 'rename', label: t('Rename'), icon: <Pencil /> }, { key: 'copy', label: t('Make a copy'), icon: <Copy /> }, { key: 'share', label: t('Sharing is unavailable'), disabled: true, icon: <Share2 /> }, { type: 'separator' }, { key: 'delete', label: t('Delete'), danger: true, icon: <Trash2 /> }]
  const [lastCommand, setLastCommand] = useState('None')
  const selectCommand = (key: string) => setLastCommand(key)

  return (
    <DemoPage>
      <DemoSection
        title="Command menu"
        description="A compact one-level menu for commands anchored to a button. Keyboard navigation skips separators and disabled items."
      >
        <DemoPreview className="demo-menu-flyout-row">
          <AppMenuFlyout
            ariaLabel={t('File actions')}
            items={commandItems}
            onSelect={selectCommand}
          >
            <button className="demo-menu-flyout-button" type="button">
              {t('More actions')}
            </button>
          </AppMenuFlyout>
          <span className="demo-note">{t('Last command:')} {t(lastCommand)}</span>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Toolbar composition"
        description="Tooltip and MenuFlyout can share the same icon-only trigger. Opening the menu closes the tooltip."
      >
        <DemoPreview>
          <AppToolbar
            appearance="flat"
            start={<span>{t('Document commands')}</span>}
            end={
              <AppMenuFlyout items={commandItems} onSelect={selectCommand}>
                <AppTooltip content={t('More actions')}>
                  <button
                    aria-label={t('More actions')}
                    className="demo-menu-flyout-icon-button"
                    type="button"
                  >
                    <Ellipsis size={18} />
                  </button>
                </AppTooltip>
              </AppMenuFlyout>
            }
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Placement and viewport behavior">
        <DemoPreview className="demo-menu-flyout-placement-grid">
          {(
            [
              'bottom-start',
              'bottom-end',
              'top-start',
              'right-start',
            ] as const
          ).map((placement) => (
            <AppMenuFlyout
              items={commandItems}
              key={placement}
              onSelect={selectCommand}
              placement={placement}
            >
              <button className="demo-menu-flyout-button" type="button">
                {t(placement)}
              </button>
            </AppMenuFlyout>
          ))}
          <span className="demo-menu-flyout-edge-trigger">
            <AppMenuFlyout
              items={commandItems}
              onSelect={selectCommand}
              placement="right-start"
            >
              <button className="demo-menu-flyout-button" type="button">
                {t('Near viewport edge')}
              </button>
            </AppMenuFlyout>
          </span>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
