import { useState } from 'react'
import {
  AppButton,
  AppCompactGroup,
  AppControlAddon,
  AppNumberBox,
  AppSelect,
  AppTextBox,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppCompactGroupPage() {
  const t = useDemoCopy()
  const [count, setCount] = useState<number | null>(10)

  return (
    <DemoPage>
      <DemoSection
        description="Attach explanatory content without moving it inside the input."
        title="Input addons"
      >
        <DemoPreview className="demo-form-stack">
          <AppCompactGroup>
            <AppControlAddon>Last</AppControlAddon>
            <AppNumberBox min={1} onValueChange={setCount} value={count} />
            <AppControlAddon>times</AppControlAddon>
          </AppCompactGroup>
          <span className="demo-note">{t('Standard')}</span>
          <AppCompactGroup>
            <AppSelect
              defaultValue="https"
              options={[
                { value: 'https', label: 'HTTPS' },
                { value: 'http', label: 'HTTP' },
              ]}
              size="standard"
            />
            <AppTextBox aria-label="Server address" placeholder="example.com" size="standard" />
            <AppButton size="standard">Connect</AppButton>
          </AppCompactGroup>
          <div style={{ display: 'grid', gap: 6 }}>
            <span className="demo-note">{t('Compact')}</span>
            <AppCompactGroup>
              <AppSelect
                defaultValue="https"
                options={[
                  { value: 'https', label: 'HTTPS' },
                  { value: 'http', label: 'HTTP' },
                ]}
                size="compact"
              />
              <AppTextBox aria-label="Server address" placeholder="example.com" size="compact" />
              <AppButton size="compact">Connect</AppButton>
            </AppCompactGroup>
          </div>
        </DemoPreview>
      </DemoSection>
      <DemoSection
        description="The group only joins the surfaces; every button keeps its own action."
        title="Independent buttons"
      >
        <DemoPreview>
          <AppCompactGroup aria-label="History actions">
            <AppButton>Back</AppButton>
            <AppButton>Forward</AppButton>
            <AppButton>Refresh</AppButton>
          </AppCompactGroup>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
