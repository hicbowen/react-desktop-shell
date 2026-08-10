import { useState } from 'react'
import {
  FileText,
  History,
  Info,
  Languages,
  MoreHorizontal,
  Palette,
  Settings,
} from '../../components/fluentIcons'
import {
  AppExpander,
  AppExpanderGroup,
  AppIconButton,
  AppSelect,
  AppSettingsRow,
} from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'

export function ExpanderPage() {
  const [expanded, setExpanded] = useState(false)

  return <DemoPage>
    <DemoSection
      description="Use a standalone AppExpander when content is optional or secondary. Each panel owns its own expanded state."
      title="General-purpose content"
    >
      <div className="demo-expander-stack">
        <AppExpander
          description="Keep secondary information out of the main flow."
          icon={<FileText />}
          title="Optional details"
        >
          <div className="demo-expander-copy">
            <p className="demo-expander-text">
              This text stays close to its trigger without blocking the page.
            </p>
            <ul className="demo-expander-list">
              <li>Short explanations remain available on demand.</li>
              <li>Longer content can stay out of the main flow.</li>
            </ul>
          </div>
        </AppExpander>
        <AppExpander defaultExpanded title="Expanded by default">
          <p className="demo-expander-text">
            Content can contain any form control or desktop component.
          </p>
        </AppExpander>
        <AppExpander
          appearance="subtle"
          expanded={expanded}
          onExpandedChange={setExpanded}
          title="Controlled expander"
        >
          <p className="demo-expander-text">
            <span>This panel is owned by page state.</span>{' '}
            <span>Controlled state:</span>{' '}
            {expanded ? 'Expanded' : 'Collapsed'}.
          </p>
        </AppExpander>
        <AppExpander disabled title="Managed by administrator">
          Unavailable content
        </AppExpander>
        <AppExpander
          actions={
            <AppIconButton
              ariaLabel="Release note actions"
              icon={<MoreHorizontal />}
            />
          }
          description="Version 0.8 added desktop primitives."
          title="Release notes"
        >
          <div className="demo-expander-copy">
            <p className="demo-expander-text">
              Version 0.8 added desktop primitives.
            </p>
            <ul className="demo-expander-list">
              <li>Improved keyboard navigation across grouped panels.</li>
              <li>Added a settings appearance for preference surfaces.</li>
            </ul>
          </div>
        </AppExpander>
      </div>
    </DemoSection>

    <DemoSection
      description="Use the settings appearance when an expander should read like a settings group and align with AppSettingsRow."
      title="Settings surface"
    >
      <AppExpander
        appearance="settings"
        defaultExpanded
        description="Keep related preferences together without making the page feel like a separate dialog."
        icon={<Settings />}
        title="Application preferences"
      >
        <div className="demo-settings-expander-rows">
          <AppSettingsRow
            control={
              <AppSelect
                defaultValue="system"
                options={[
                  { value: 'system', label: 'Follow system' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
              />
            }
            description="Choose a fixed theme or follow the operating system."
            icon={<Palette />}
            title="Theme"
          />
          <AppSettingsRow
            control={
              <AppSelect
                defaultValue="system"
                options={[
                  { value: 'system', label: 'Follow system' },
                  { value: 'zh-CN', label: 'Chinese' },
                  { value: 'en-US', label: 'English' },
                ]}
              />
            }
            description="Choose the language used by the surrounding application."
            icon={<Languages />}
            title="Language"
          />
        </div>
      </AppExpander>
    </DemoSection>

    <DemoSection
      description="Use AppExpanderGroup with single mode when related sections share one surface and only one should stay open."
      title="Accordion group"
    >
      <AppExpanderGroup
        aria-label="Project sections"
        collapsible={false}
        defaultValue="overview"
        expansionMode="single"
      >
        <AppExpander
          description="A short summary of the project and its current focus."
          icon={<FileText />}
          title="Project overview"
          value="overview"
        >
          <div className="demo-expander-copy">
            <p className="demo-expander-text">
              This example keeps component content separate from shell navigation and window chrome.
            </p>
          </div>
        </AppExpander>
        <AppExpander
          description="A chronological view of recent work and decisions."
          icon={<History />}
          title="Recent activity"
          value="activity"
        >
          <div className="demo-expander-copy">
            <ul className="demo-expander-list">
              <li>Refined the settings surface.</li>
              <li>Checked keyboard and reduced-motion behavior.</li>
              <li>Verified the continuous group interaction.</li>
            </ul>
          </div>
        </AppExpander>
        <AppExpander
          description="Notes that are useful while implementing or reviewing the feature."
          icon={<Info />}
          title="Implementation notes"
          value="notes"
        >
          <div className="demo-expander-copy">
            <p className="demo-expander-text">
              Use a group when sections share a clear relationship; otherwise keep panels independent.
            </p>
          </div>
        </AppExpander>
      </AppExpanderGroup>
    </DemoSection>
  </DemoPage>
}
