import { useDemoI18n } from './DemoI18nContext'

export const zhCNInteractiveText: Record<string, string> = {
  Rail: '导航栏',
  'Title bar': '标题栏',
  Content: '内容',
  'Overlay layers': '浮层',
  'Open react-desktop-shell on GitHub': '在 GitHub 上打开 react-desktop-shell',
  'Current preview state:': '当前预览状态：',
  maximized: '已最大化',
  restored: '已还原',
  'Example page': '示例页面',
  'Supporting description text': '辅助说明文字',
  Action: '操作',
  'Page content': '页面内容',
  'Open pane': '打开窗格',
  Resizable: '可调整大小',
  'Host page': '宿主页面',
  'Side pane preview': '侧边窗格预览',
  Close: '关闭',
  Label: '标签',
  'Neutral example value': '中性的示例值',
  'Open the pane to inspect sizing, dismissal, and resize behavior.': '打开窗格以查看尺寸、关闭和调整大小的行为。',
  Files: '文件',
  'Editor workspace': '编辑器工作区',
  Ready: '就绪',
  Connected: '已连接',
  'Ln 24, Col 8': '第 24 行，第 8 列',
}

export function useDemoCopy() {
  const { locale } = useDemoI18n()
  return (text: string) => locale === 'zh-CN' ? (zhCNInteractiveText[text] ?? text) : text
}
