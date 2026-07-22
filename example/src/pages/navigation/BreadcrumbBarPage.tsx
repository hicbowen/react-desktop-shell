import { AppBreadcrumbBar } from '../../../../src'; import { DemoPage, DemoSection } from '../../components/DemoPage'
export function AppBreadcrumbBarPage() { return <DemoPage><DemoSection title="Resource path"><AppBreadcrumbBar items={['Home','Documents','Projects','react-desktop-shell','src','components'].map((label) => ({ key: label, label }))} maxVisibleItems={4} /></DemoSection></DemoPage> }
