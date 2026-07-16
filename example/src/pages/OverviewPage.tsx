import { Database, LayoutPanelTop, MessageSquare, MousePointerClick, Settings } from 'lucide-react'
import { DemoPage } from '../components/DemoPage'

const categories = [
  [LayoutPanelTop, 'Shell & Layout', 'Application frame, pages, title bar, and side pane.'],
  [MessageSquare, 'Feedback', 'Inline, transient, and modal feedback patterns.'],
  [MousePointerClick, 'Actions', 'Toolbars and contextual commands.'],
  [Database, 'Data', 'Tables, composed data views, and selection actions.'],
  [Settings, 'Settings', 'Structured preferences and live theme controls.'],
] as const

export function OverviewPage() {
  return <DemoPage><section className="demo-hero"><span>COMPONENT GALLERY · v{__APP_VERSION__}</span><h2>Desktop React components, one focused example at a time</h2><p>Choose a component by its exported name. Each page keeps its own state so examples remain easy to inspect, test, and copy.</p></section><div className="demo-card-grid">{categories.map(([Icon, title, text]) => <article className="demo-card" key={title}><Icon size={20} /><h3>{title}</h3><p>{text}</p></article>)}</div></DemoPage>
}
