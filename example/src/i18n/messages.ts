export const enUSDemoMessages = {
  overview: {
    eyebrow: 'COMPONENT GALLERY',
    title: 'Desktop React components, one focused example at a time',
    description: 'Choose a component by its exported name. Each page keeps its own state so examples remain easy to inspect, test, and copy.',
  },
  settings: {
    sectionTitle: 'Application settings',
    sectionDescription: 'Settings groups and rows organize appearance, language, preferences, and read-only application information.',
    appearance: 'Appearance', appearanceDescription: 'Changes apply to the real outer AppShell immediately.',
    theme: 'Theme', themeDescription: 'Choose a fixed color theme or follow the operating system.', themeAria: 'Theme',
    language: 'Language', languageDescription: 'Controls the example content, built-in component labels, dates, and time display.', languageAria: 'Language',
    preferences: 'Preferences', preferencesDescription: 'Dependent settings demonstrate interactive and disabled row states.',
    enableFeature: 'Enable feature', enableFeatureDescription: 'Controls whether the dependent detail setting is available.',
    detailLevel: 'Detail level', detailLevelDescription: 'Select how much supporting information the feature displays.',
    about: 'About', version: 'Version', versionDescription: 'Current react-desktop-shell Example version.',
    themeOptions: { system: 'Follow system', light: 'Light', dark: 'Dark' },
    localeOptions: { system: 'Follow system', 'zh-CN': '简体中文', 'en-US': 'English' },
    detailOptions: { compact: 'Compact', standard: 'Standard', detailed: 'Detailed' },
  },
  categories: {
    shell: ['Application frame', 'Windows, pages, panes, and layout containers.'],
    navigation: ['Navigation', 'Application, page, and collection navigation patterns.'],
    actions: ['Commands & actions', 'Buttons, shared commands, shortcuts, and menus.'],
    input: ['Input & selection', 'Text, numeric, selection, date-time, and specialized inputs.'],
    data: ['Data & collections', 'Lists, trees, tables, selection actions, and properties.'],
    content: ['Content display', 'Containers, markers, content states, and structure.'],
    feedback: ['Feedback & overlays', 'Status feedback, supporting overlays, dialogs, and drag feedback.'],
  },
}

export type DemoMessages = typeof enUSDemoMessages

export const zhCNDemoMessages: DemoMessages = {
  overview: {
    eyebrow: '组件展廊',
    title: '专为桌面应用打造的 React 组件，一次看懂一个示例',
    description: '按组件的导出名称选择页面。每个页面独立维护状态，便于查看、测试和复制示例。',
  },
  settings: {
    sectionTitle: '应用设置',
    sectionDescription: '通过设置分组和设置项组织外观、语言、偏好以及只读的应用信息。',
    appearance: '外观', appearanceDescription: '更改会立即应用到外层真实的 AppShell。',
    theme: '主题', themeDescription: '选择固定的颜色主题，或跟随操作系统设置。', themeAria: '主题',
    language: '语言', languageDescription: '控制示例内容、组件内置标签、日期和时间的显示语言。', languageAria: '语言',
    preferences: '偏好设置', preferencesDescription: '通过相互依赖的设置演示交互状态和禁用状态。',
    enableFeature: '启用功能', enableFeatureDescription: '控制下方的详细程度设置是否可用。',
    detailLevel: '详细程度', detailLevelDescription: '选择该功能显示多少辅助信息。',
    about: '关于', version: '版本', versionDescription: '当前 react-desktop-shell 示例应用的版本。',
    themeOptions: { system: '跟随系统', light: '浅色', dark: '深色' },
    localeOptions: { system: '跟随系统', 'zh-CN': '简体中文', 'en-US': 'English' },
    detailOptions: { compact: '精简', standard: '标准', detailed: '详细' },
  },
  categories: {
    shell: ['应用框架', '窗口、页面、窗格和布局容器。'],
    navigation: ['导航', '应用、页面和集合导航模式。'],
    actions: ['命令与操作', '按钮、共享命令、快捷键和菜单。'],
    input: ['输入与选择', '文本、数值、选择、日期时间和专用输入。'],
    data: ['数据与集合', '列表、树、表格、选择操作和属性。'],
    content: ['内容展示', '内容容器、标记、状态和结构。'],
    feedback: ['反馈与浮层', '状态反馈、辅助浮层、对话框和拖放反馈。'],
  },
}
