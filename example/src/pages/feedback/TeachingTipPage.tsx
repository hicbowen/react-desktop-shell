import { useState } from 'react'
import { Download, FileImage, FileText } from 'lucide-react'
import {
  AppShell,
  AppSplitButton,
  AppTeachingTip,
  type AppMenuFlyoutEntry,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const exportItems: AppMenuFlyoutEntry[] = [
  { key: 'pdf', label: 'Export PDF', icon: <FileText /> },
  { key: 'image', label: 'Export image', icon: <FileImage /> },
]

export function AppTeachingTipPage() {
  const [openTip, setOpenTip] = useState<string | null>('basic')
  const setTipOpen = (key: string) => (open: boolean) =>
    setOpenTip(open ? key : null)

  return (
    <DemoPage>
      <DemoSection title="Guidance cards" description="TeachingTip stays controlled by application state and can include persistent guidance and actions.">
        <DemoPreview className="demo-teaching-tip-row">
          <AppTeachingTip
            content="You can now export multiple records in one operation."
            onOpenChange={setTipOpen('basic')}
            open={openTip === 'basic'}
            primaryAction={{ label: 'Got it', onClick: () => undefined }}
            title="Batch export is available"
          >
            <button className="demo-menu-flyout-button" onClick={() => setOpenTip('basic')} type="button">Basic tip</button>
          </AppTeachingTip>
          <AppTeachingTip
            content="Choose whether to review the changes now or return to them later."
            onOpenChange={setTipOpen('actions')}
            open={openTip === 'actions'}
            primaryAction={{ label: 'Review now', onClick: () => undefined }}
            secondaryAction={{ label: 'Later', onClick: () => undefined }}
            title="Review changes"
          >
            <button className="demo-menu-flyout-button" onClick={() => setOpenTip('actions')} type="button">Two actions</button>
          </AppTeachingTip>
          <AppTeachingTip
            closeOnOutsidePointerDown={false}
            content="Use an action or the close button; clicking outside intentionally keeps this guidance open."
            onOpenChange={setTipOpen('persistent')}
            open={openTip === 'persistent'}
            placement="bottom-start"
            title="Persistent guidance"
          >
            <button className="demo-menu-flyout-button" onClick={() => setOpenTip('persistent')} type="button">Ignore outside clicks</button>
          </AppTeachingTip>
          <span className="demo-teaching-tip-edge-trigger">
            <AppTeachingTip
              content="The preferred right placement flips when the viewport edge is too close."
              onOpenChange={setTipOpen('edge')}
              open={openTip === 'edge'}
              placement="right"
              title="Automatic placement"
            >
              <button className="demo-menu-flyout-button" onClick={() => setOpenTip('edge')} type="button">Near the edge</button>
            </AppTeachingTip>
          </span>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Explaining a split button">
        <DemoPreview>
          <AppTeachingTip
            content="Run the default export from the left side, or open the arrow for another format."
            onOpenChange={setTipOpen('split')}
            open={openTip === 'split'}
            placement="right-start"
            primaryAction={{ label: 'Understood', onClick: () => undefined }}
            title="Two ways to export"
          >
            <span className="demo-teaching-tip-anchor">
              <AppSplitButton icon={<Download />} items={exportItems} label="Export" onClick={() => setOpenTip('split')} />
            </span>
          </AppTeachingTip>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Dark theme boundary">
        <DemoPreview className="demo-teaching-tip-dark-preview">
          <AppShell theme="dark">
            <div className="demo-teaching-tip-dark-content">
              <AppTeachingTip
                content="The overlay portals into this shell and inherits its dark theme variables."
                onOpenChange={setTipOpen('dark')}
                open={openTip === 'dark'}
                placement="bottom"
                title="Dark teaching tip"
              >
                <button className="demo-menu-flyout-button" onClick={() => setOpenTip('dark')} type="button">Show dark tip</button>
              </AppTeachingTip>
            </div>
          </AppShell>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
