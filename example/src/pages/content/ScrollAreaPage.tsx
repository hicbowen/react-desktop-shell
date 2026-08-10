import { useState } from 'react'
import { Clock3, FileClock, Settings2 } from '../../components/fluentIcons'
import {
  AppButton,
  AppCard,
  AppCardFooter,
  AppCardHeader,
  AppSegmentedControl,
  AppScrollArea,
  AppSettingsGroup,
  AppSettingsRow,
} from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const entries = Array.from({ length: 18 }, (_, index) => index + 1)

function ScrollRows({ count = entries.length }: { count?: number }) {
  const t = useDemoCopy()
  return (
    <div className="demo-scroll-list">
      {entries.slice(0, count).map((entry) => (
        <div className="demo-scroll-row" key={entry}>{t('Record')} {entry}</div>
      ))}
    </div>
  )
}

export function AppScrollAreaPage() {
  const t = useDemoCopy()
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal' | 'both'>('vertical')
  const [showOverflow, setShowOverflow] = useState(false)
  const gutterCount = showOverflow ? 18 : 4

  return (
    <DemoPage>
      <DemoSection title="Orientation">
        <DemoControls>
          <span>{t('Scroll direction')}</span>
          <AppSegmentedControl
            ariaLabel={t('Scroll direction')}
            onValueChange={(value) => {
              if (value === 'vertical' || value === 'horizontal' || value === 'both') setOrientation(value)
            }}
            options={[
              { value: 'vertical', label: t('Vertical') },
              { value: 'horizontal', label: t('Horizontal') },
              { value: 'both', label: t('Both directions') },
            ]}
            size="compact"
            value={orientation}
          />
        </DemoControls>
        <DemoPreview>
          <AppScrollArea
            aria-label={t(orientation === 'vertical' ? 'Recent records' : orientation === 'horizontal' ? 'Timeline' : 'Data matrix')}
            className="demo-scroll-frame"
            orientation={orientation}
            style={{ height: orientation === 'vertical' ? 240 : orientation === 'horizontal' ? 120 : 220 }}
          >
            {orientation === 'vertical' ? <ScrollRows /> : orientation === 'horizontal' ? (
              <div className="demo-scroll-horizontal-content">
                {Array.from({ length: 12 }, (_, index) => (
                  <div className="demo-scroll-tile" key={index}>{t('Phase')} {index + 1}</div>
                ))}
              </div>
            ) : (
              <div className="demo-scroll-matrix">
                {Array.from({ length: 80 }, (_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>
            )}
          </AppScrollArea>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Scrollbar modes">
        <DemoPreview>
          <div className="demo-scroll-comparison">
            {(['auto', 'always', 'hidden'] as const).map((scrollbar) => (
              <div className="demo-scroll-sample" key={scrollbar}>
                <strong>{t(scrollbar)}</strong>
                <AppScrollArea
                  aria-label={`${t(scrollbar)}${t('scrollbar example')}`}
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
              {t(showOverflow ? 'Reduce content' : 'Add content')}
            </AppButton>
          </div>
          <div className="demo-scroll-comparison">
            {(['auto', 'stable'] as const).map((gutter) => (
              <div className="demo-scroll-sample" key={gutter}>
                <strong>{t('gutter')}: {t(gutter)}</strong>
                <AppScrollArea
                  aria-label={`${t(gutter)}${t('gutter example')}`}
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
            aria-label={t('Theme-aware activity')}
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
              title={t('Release notes')}
              description={t('Recently installed versions')}
            />
            <AppScrollArea
              aria-label={t('Release notes')}
              gutter="stable"
              style={{ maxHeight: 220 }}
            >
              <ScrollRows count={14} />
            </AppScrollArea>
            <AppCardFooter start="Version 0.6.0" end={<AppButton appearance="primary">{t('Check for updates')}</AppButton>} />
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Settings detail pane">
        <DemoPreview>
          <div className="demo-scroll-settings-pane">
            <header><Settings2 size={18} /><strong>{t('Tool settings')}</strong></header>
            <AppScrollArea aria-label={t('Tool settings')} gutter="stable">
              <AppSettingsGroup>
                {Array.from({ length: 10 }, (_, index) => (
                  <AppSettingsRow
                    key={index}
                    icon={<Clock3 />}
                    title={`${t('Option')} ${index + 1}`}
                    description={t('Example configuration for a desktop tool')}
                    control={<AppButton size="compact">{t('Configure')}</AppButton>}
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
