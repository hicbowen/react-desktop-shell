import { Button } from 'antd'
import { Folder, Home, RefreshCw, Settings } from 'lucide-react'
import { AppRail, AppTooltip, type RailEntry } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const compactRailItems: RailEntry[] = [
  { key: 'home', label: 'Home', icon: <Home size={16} /> },
  { key: 'files', label: 'Files', icon: <Folder size={16} /> },
  {
    key: 'disabled',
    label: 'Unavailable',
    icon: <Settings size={16} />,
    disabled: true,
  },
]

export function AppTooltipPage() {
  return (
    <DemoPage>
      <DemoSection
        title="Common triggers"
        description="Hover a trigger after the short delay, or focus it with the keyboard for an immediate description."
      >
        <DemoPreview className="demo-tooltip-row">
          <AppTooltip content="Refresh the current data">
            <Button>Standard button</Button>
          </AppTooltip>
          <AppTooltip content="Refresh data">
            <button
              aria-label="Refresh data"
              className="demo-tooltip-icon-button"
              type="button"
            >
              <RefreshCw size={16} />
            </button>
          </AppTooltip>
          <AppTooltip content="Select a row first">
            <button className="demo-tooltip-button" disabled type="button">
              Disabled native button
            </button>
          </AppTooltip>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Placement and wrapping">
        <DemoPreview className="demo-tooltip-grid">
          {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
            <AppTooltip
              content={`${placement} placement`}
              key={placement}
              placement={placement}
            >
              <Button>{placement}</Button>
            </AppTooltip>
          ))}
          <AppTooltip
            content="Long tooltip text wraps within its configured maximum width instead of forcing the overlay beyond the viewport."
            maxWidth={220}
            placement="bottom-start"
          >
            <Button>Long content</Button>
          </AppTooltip>
          <span className="demo-tooltip-edge-trigger">
            <AppTooltip content="This right placement flips when the viewport edge is too close." placement="right">
              <Button>Near the edge</Button>
            </AppTooltip>
          </span>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Collapsed rail"
        description="Collapsed rail items add AppTooltip automatically, including disabled items."
      >
        <DemoPreview className="demo-tooltip-rail-preview">
          <AppRail
            collapsed
            footerItems={[
              { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
            ]}
            items={compactRailItems}
          />
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
