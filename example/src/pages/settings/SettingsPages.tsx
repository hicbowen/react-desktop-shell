import { useState } from 'react'
import { BadgeInfo, Languages, ListFilter, Palette, Sparkles } from '../../components/fluentIcons'
import { APP_THEME_PRESETS, AppExpander, AppSelect, AppSettingsGroup, AppSettingsRow, AppToggleSwitch, type AppThemePreset } from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'
import { useDemoShell } from '../../components/DemoShellContext'
import { useDemoI18n } from '../../i18n/DemoI18nContext'

export function SettingsPage() {
  const {
    locale,
    setLocale,
    theme,
    setTheme,
    themePreset,
    setThemePreset,
  } = useDemoShell()
  const { messages } = useDemoI18n()
  const text = messages.settings
  const themeOptions = Object.entries(text.themeOptions).map(([value, label]) => ({ value, label }))
  const themePresetOptions = APP_THEME_PRESETS.map((value) => ({
    value,
    label: text.themePresetOptions[value],
  }))
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
                  aria-label={text.colorThemeAria}
                  onValueChange={(value) => {
                    if (APP_THEME_PRESETS.includes(value as AppThemePreset)) {
                      setThemePreset(value as AppThemePreset)
                    }
                  }}
                  options={themePresetOptions}
                  value={themePreset}
                />
              }
              description={text.colorThemeDescription}
              icon={<Palette />}
              title={text.colorTheme}
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

          <AppExpander
            appearance="settings"
            defaultExpanded
            description={text.preferencesDescription}
            icon={<Sparkles />}
            title={text.preferences}
          >
            <div className="demo-settings-expander-rows">
              <AppSettingsRow
                control={
                  <AppToggleSwitch
                    aria-label={text.enableFeature}
                    checked={enabled}
                    onCheckedChange={setEnabled}
                  />
                }
                description={text.enableFeatureDescription}
                reserveIconSpace
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
                reserveIconSpace
                title={text.detailLevel}
              />
            </div>
          </AppExpander>

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
