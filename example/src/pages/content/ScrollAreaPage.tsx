import { useState } from 'react'
import { Clock3, FileClock, Settings2 } from 'lucide-react'
import {
  AppButton,
  AppCard,
  AppCardFooter,
  AppCardHeader,
  AppScrollArea,
  AppSettingsGroup,
  AppSettingsRow,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const entries = Array.from({ length: 18 }, (_, index) => `Record ${index + 1}`)

function ScrollRows({ count = entries.length }: { count?: number }) {
  return (
    <div className="demo-scroll-list">
      {entries.slice(0, count).map((entry) => (
        <div className="demo-scroll-row" key={entry}>{entry}</div>
      ))}
    </div>
  )
}

export function AppScrollAreaPage() {
  const [showOverflow, setShowOverflow] = useState(false)
  const gutterCount = showOverflow ? 18 : 4

  return (
    <DemoPage>
      <DemoSection title="Vertical">
        <DemoPreview>
          <AppScrollArea
            aria-label="Recent records"
            className="demo-scroll-frame"
            style={{ height: 240 }}
          >
            <ScrollRows />
          </AppScrollArea>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Horizontal">
        <DemoPreview>
          <AppScrollArea
            aria-label="Timeline"
            className="demo-scroll-frame"
            orientation="horizontal"
          >
            <div className="demo-scroll-horizontal-content">
              {Array.from({ length: 12 }, (_, index) => (
                <div className="demo-scroll-tile" key={index}>Phase {index + 1}</div>
              ))}
            </div>
          </AppScrollArea>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Both directions">
        <DemoPreview>
          <AppScrollArea
            aria-label="Data matrix"
            className="demo-scroll-frame"
            orientation="both"
            style={{ height: 220 }}
          >
            <div className="demo-scroll-matrix">
              {Array.from({ length: 80 }, (_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
          </AppScrollArea>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Scrollbar modes">
        <DemoPreview>
          <div className="demo-scroll-comparison">
            {(['auto', 'always', 'hidden'] as const).map((scrollbar) => (
              <div className="demo-scroll-sample" key={scrollbar}>
                <strong>{scrollbar}</strong>
                <AppScrollArea
                  aria-label={`${scrollbar} scrollbar example`}
                  className="demo-scroll-frame"
                  scrollbar={scrollbar}
                  style={{ height: 180 }}
                >
                  <ScrollRows count={12} />
                </AppScrollArea>
              </div>
            ))}
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Gutter stability">
        <DemoPreview>
          <div className="demo-scroll-toolbar">
            <AppButton onClick={() => setShowOverflow((value) => !value)}>
              {showOverflow ? 'Reduce content' : 'Add content'}
            </AppButton>
          </div>
          <div className="demo-scroll-comparison">
            {(['auto', 'stable'] as const).map((gutter) => (
              <div className="demo-scroll-sample" key={gutter}>
                <strong>gutter: {gutter}</strong>
                <AppScrollArea
                  aria-label={`${gutter} gutter example`}
                  className="demo-scroll-frame"
                  gutter={gutter}
                  style={{ height: 180 }}
                >
                  <ScrollRows count={gutterCount} />
                </AppScrollArea>
              </div>
            ))}
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Theme-aware surface">
        <DemoPreview>
          <AppScrollArea
            aria-label="Theme-aware activity"
            className="demo-scroll-frame"
            gutter="stable"
            style={{ height: 180 }}
          >
            <ScrollRows count={12} />
          </AppScrollArea>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Inside a Card">
        <DemoPreview>
          <AppCard>
            <AppCardHeader
              icon={<FileClock />}
              title="Release notes"
              description="Recently installed versions"
            />
            <AppScrollArea
              aria-label="Release notes"
              gutter="stable"
              style={{ maxHeight: 220 }}
            >
              <ScrollRows count={14} />
            </AppScrollArea>
            <AppCardFooter start="Version 0.6.0" end={<AppButton appearance="primary">Check for updates</AppButton>} />
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Settings detail pane">
        <DemoPreview>
          <div className="demo-scroll-settings-pane">
            <header><Settings2 size={18} /><strong>Tool settings</strong></header>
            <AppScrollArea aria-label="Tool settings" gutter="stable">
              <AppSettingsGroup>
                {Array.from({ length: 10 }, (_, index) => (
                  <AppSettingsRow
                    key={index}
                    icon={<Clock3 />}
                    title={`Option ${index + 1}`}
                    description="Example configuration for a desktop tool"
                    control={<AppButton size="compact">Configure</AppButton>}
                  />
                ))}
              </AppSettingsGroup>
            </AppScrollArea>
          </div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
