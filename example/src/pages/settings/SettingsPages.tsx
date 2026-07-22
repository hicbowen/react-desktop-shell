import { useState } from 'react'
import { BadgeInfo, Languages, ListFilter, Palette, Sparkles } from 'lucide-react'
import { AppSelect, AppSettingsGroup, AppSettingsRow, AppToggleSwitch } from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'
import { useDemoShell } from '../../components/DemoShellContext'
import { useDemoI18n } from '../../i18n/DemoI18nContext'

export function SettingsPage() {
  const { locale, setLocale, theme, setTheme } = useDemoShell()
  const { messages } = useDemoI18n()
  const text = messages.settings
  const themeOptions = Object.entries(text.themeOptions).map(([value, label]) => ({ value, label }))
  const localeOptions = Object.entries(text.localeOptions).map(([value, label]) => ({ value, label }))
  const detailOptions = Object.entries(text.detailOptions).map(([value, label]) => ({ value, label }))
  const [enabled, setEnabled] = useState(true)
  const [detail, setDetail] = useState('standard')

  return (
    <DemoPage>
      <DemoSection
        title={text.sectionTitle}
        description={text.sectionDescription}
      >
        <div className="demo-settings">
          <AppSettingsGroup
            title={text.appearance}
            description={text.appearanceDescription}
          >
            <AppSettingsRow
              control={
                <AppSelect
                  aria-label={text.themeAria}
                  onValueChange={(value) => {
                    if (value === 'system' || value === 'light' || value === 'dark') {
                      setTheme(value)
                    }
                  }}
                  options={themeOptions}
                  value={theme}
                />
              }
              description={text.themeDescription}
              icon={<Palette />}
              title={text.theme}
            />
            <AppSettingsRow
              control={
                <AppSelect
                  aria-label={text.languageAria}
                  onValueChange={(value) => {
                    if (value === 'system' || value === 'zh-CN' || value === 'en-US') {
                      setLocale(value)
                    }
                  }}
                  options={localeOptions}
                  value={locale}
                />
              }
              description={text.languageDescription}
              icon={<Languages />}
              title={text.language}
            />
          </AppSettingsGroup>

          <AppSettingsGroup
            title={text.preferences}
            description={text.preferencesDescription}
          >
            <AppSettingsRow
              control={
                <AppToggleSwitch
                  aria-label={text.enableFeature}
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              }
              description={text.enableFeatureDescription}
              icon={<Sparkles />}
              title={text.enableFeature}
            />
            <AppSettingsRow
              control={
                <AppSelect
                  aria-label={text.detailLevel}
                  disabled={!enabled}
                  onValueChange={setDetail}
                  options={detailOptions}
                  value={detail}
                />
              }
              description={text.detailLevelDescription}
              disabled={!enabled}
              icon={<ListFilter />}
              title={text.detailLevel}
            />
          </AppSettingsGroup>

          <AppSettingsGroup title={text.about}>
            <AppSettingsRow
              control={<strong>v{__APP_VERSION__}</strong>}
              description={text.versionDescription}
              icon={<BadgeInfo />}
              title={text.version}
            />
          </AppSettingsGroup>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
