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

export function AppCompactGroupPage() {
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
          <AppCompactGroup>
            <AppSelect
              defaultValue="https"
              options={[
                { value: 'https', label: 'HTTPS' },
                { value: 'http', label: 'HTTP' },
              ]}
            />
            <AppTextBox aria-label="Server address" placeholder="example.com" />
            <AppButton>Connect</AppButton>
          </AppCompactGroup>
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
