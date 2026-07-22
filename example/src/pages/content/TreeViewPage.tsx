import { FileCode2, FileText, Folder } from 'lucide-react'
import { AppTreeView, type AppTreeItem } from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'

const items: AppTreeItem[] = [{ key: 'src', label: 'src', icon: <Folder />, children: [{ key: 'components', label: 'components', icon: <Folder />, children: [{ key: 'shell', label: 'AppShell.tsx', icon: <FileCode2 /> }] }, { key: 'index', label: 'index.ts', icon: <FileCode2 /> }] }, { key: 'readme', label: 'README.md', icon: <FileText /> }]
export function AppTreeViewPage() { return <DemoPage><DemoSection title="Project resources" description="Hierarchical selection, expansion, keyboard navigation, lazy loading, and host-owned drops."><div style={{ maxWidth: 360 }}><AppTreeView defaultExpandedKeys={['src', 'components']} items={items} /></div></DemoSection></DemoPage> }
