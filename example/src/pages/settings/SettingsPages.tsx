import { useState } from 'react'
import { BadgeInfo, Languages, ListFilter, Palette, Sparkles } from 'lucide-react'
import { AppSelect, AppSettingsGroup, AppSettingsRow, AppToggleSwitch } from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'
import { useDemoShell } from '../../components/DemoShellContext'

const themeOptions = [
  { value: 'system', label: 'Follow system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const localeOptions = [
  { value: 'system', label: 'Follow system' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
]

const detailOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'detailed', label: 'Detailed' },
]

export function SettingsPage() {
  const { locale, setLocale, theme, setTheme } = useDemoShell()
  const [enabled, setEnabled] = useState(true)
  const [detail, setDetail] = useState('standard')

  return (
    <DemoPage>
      <DemoSection
        title="Application settings"
        description="Settings groups and rows organize appearance, language, preferences, and read-only application information."
      >
        <div className="demo-settings">
          <AppSettingsGroup
            title="Appearance"
            description="Changes apply to the real outer AppShell immediately."
          >
            <AppSettingsRow
              control={
                <AppSelect
                  aria-label="Theme"
                  onValueChange={(value) => {
                    if (value === 'system' || value === 'light' || value === 'dark') {
                      setTheme(value)
                    }
                  }}
                  options={themeOptions}
                  value={theme}
                />
              }
              description="Choose a fixed color theme or follow the operating system."
              icon={<Palette />}
              title="Theme"
            />
            <AppSettingsRow
              control={
                <AppSelect
                  aria-label="Language"
                  onValueChange={(value) => {
                    if (value === 'system' || value === 'zh-CN' || value === 'en-US') {
                      setLocale(value)
                    }
                  }}
                  options={localeOptions}
                  value={locale}
                />
              }
              description="Controls built-in component labels, dates, and time display."
              icon={<Languages />}
              title="Language"
            />
          </AppSettingsGroup>

          <AppSettingsGroup
            title="Preferences"
            description="Dependent settings demonstrate interactive and disabled row states."
          >
            <AppSettingsRow
              control={
                <AppToggleSwitch
                  aria-label="Enable feature"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              }
              description="Controls whether the dependent detail setting is available."
              icon={<Sparkles />}
              title="Enable feature"
            />
            <AppSettingsRow
              control={
                <AppSelect
                  aria-label="Detail level"
                  disabled={!enabled}
                  onValueChange={setDetail}
                  options={detailOptions}
                  value={detail}
                />
              }
              description="Select how much supporting information the feature displays."
              disabled={!enabled}
              icon={<ListFilter />}
              title="Detail level"
            />
          </AppSettingsGroup>

          <AppSettingsGroup title="About">
            <AppSettingsRow
              control={<strong>v{__APP_VERSION__}</strong>}
              description="Current react-desktop-shell Example version."
              icon={<BadgeInfo />}
              title="Version"
            />
          </AppSettingsGroup>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
