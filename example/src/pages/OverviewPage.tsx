import { Database, LayoutPanelTop, MessageSquare, MousePointerClick, Settings } from 'lucide-react'
import { DemoPage } from '../components/DemoPage'
import { useDemoI18n } from '../i18n/DemoI18nContext'

export function OverviewPage() {
  const { messages } = useDemoI18n()
  const categoryMessages = messages.categories
  const categories = [
    [LayoutPanelTop, ...categoryMessages.shell],
    [MessageSquare, ...categoryMessages.feedback],
    [MousePointerClick, ...categoryMessages.actions],
    [Database, ...categoryMessages.data],
    [Settings, ...categoryMessages.settings],
  ] as const
  return <DemoPage><section className="demo-hero"><span>{messages.overview.eyebrow} · v{__APP_VERSION__}</span><h2>{messages.overview.title}</h2><p>{messages.overview.description}</p></section><div className="demo-card-grid">{categories.map(([Icon, title, text]) => <article className="demo-card" key={title}><Icon size={20} /><h3>{title}</h3><p>{text}</p></article>)}</div></DemoPage>
}
