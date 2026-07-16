import { useState } from 'react'
import { Settings } from 'lucide-react'
import {
  AppExpander,
  AppIconButton,
  AppSelect,
  AppTextBox,
  AppToggleSwitch,
} from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'

export function ExpanderPage() {
  const [expanded, setExpanded] = useState(false)

  return <DemoPage>
    <DemoSection title="Expansion states">
      <div className="demo-expander-stack">
        <AppExpander
          description="Usually these options do not need changes."
          icon={<Settings />}
          title="Advanced settings"
        >
          <div className="demo-expander-form">
            <AppToggleSwitch label="Verbose logging" />
            <AppTextBox placeholder="Custom cache path" />
          </div>
        </AppExpander>
        <AppExpander defaultExpanded title="Expanded by default">
          <p className="demo-expander-text">
            Content can contain any form control or desktop component.
          </p>
        </AppExpander>
        <AppExpander disabled title="Managed by administrator">
          Unavailable content
        </AppExpander>
        <AppExpander
          appearance="subtle"
          expanded={expanded}
          onExpandedChange={setExpanded}
          title="Controlled expander"
        >
          Controlled state: {expanded ? 'open' : 'closed'}
        </AppExpander>
        <AppExpander
          actions={
            <AppIconButton
              ariaLabel="Choose update channel"
              icon={<Settings />}
            />
          }
          description="Version 0.8 added desktop primitives."
          title="Release notes"
        >
          <div className="demo-expander-control">
            <AppSelect
              options={[
                { value: 'stable', label: 'Stable' },
                { value: 'preview', label: 'Preview' },
              ]}
            />
          </div>
        </AppExpander>
      </div>
    </DemoSection>
  </DemoPage>
}
