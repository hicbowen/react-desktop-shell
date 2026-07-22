import { Boxes, Database, FormInput, LayoutPanelTop, MessageSquare, MousePointerClick, Navigation } from 'lucide-react'
import { DemoPage } from '../components/DemoPage'
import { useDemoI18n } from '../i18n/DemoI18nContext'
import { useDemoShell } from '../components/DemoShellContext'

export function OverviewPage() {
  const { messages } = useDemoI18n()
  const { navigateTo, pages = [] } = useDemoShell()
  const categoryMessages = messages.categories
  const categories = [
    ['shell', LayoutPanelTop, ...categoryMessages.shell],
    ['navigation', Navigation, ...categoryMessages.navigation],
    ['actions', MousePointerClick, ...categoryMessages.actions],
    ['input', FormInput, ...categoryMessages.input],
    ['data', Database, ...categoryMessages.data],
    ['content', Boxes, ...categoryMessages.content],
    ['feedback', MessageSquare, ...categoryMessages.feedback],
  ] as const
  return <DemoPage><section className="demo-hero"><span>{messages.overview.eyebrow} · v{__APP_VERSION__}</span><h2>{messages.overview.title}</h2><p>{messages.overview.description}</p></section><div className="demo-card-grid">{categories.map(([category, Icon, title, description]) => {
    const categoryPages = pages.filter((page) => page.category === category)
    return <button className="demo-card demo-card--button" key={category} onClick={() => categoryPages[0] && navigateTo?.(categoryPages[0].key)} type="button"><Icon size={20} /><h3>{title}</h3><strong className="demo-card__count">{categoryPages.length}</strong><p>{description}</p></button>
  })}</div></DemoPage>
}
