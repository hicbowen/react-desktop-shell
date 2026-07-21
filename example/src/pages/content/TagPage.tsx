import { Code2, Folder } from 'lucide-react'
import { useState } from 'react'
import { AppTag, type AppTagColor } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const colors: AppTagColor[] = ['neutral', 'brand', 'blue', 'teal', 'green', 'yellow', 'orange', 'red', 'purple', 'pink']

export function TagPage() {
  const [topics, setTopics] = useState(['React', 'TypeScript', 'Desktop'])
  return <DemoPage>
    <DemoSection title="Colors" description="Use semantic colors for meaning and palette colors for categories.">
      <DemoPreview className="demo-component-row">
        {colors.map((color) => <AppTag color={color} key={color}>{color}</AppTag>)}
      </DemoPreview>
    </DemoSection>
    <DemoSection title="Appearances and shapes">
      <DemoPreview className="demo-component-row">
        <AppTag color="brand">Subtle</AppTag>
        <AppTag appearance="filled" color="purple">Filled</AppTag>
        <AppTag appearance="outline" color="teal">Outline</AppTag>
        <AppTag color="blue" shape="circular">Circular</AppTag>
        <AppTag color="orange" icon={<Folder />}>Project</AppTag>
        <AppTag color="green" icon={<Code2 />} size="small">Code</AppTag>
        <AppTag color="neutral" disabled>Disabled</AppTag>
      </DemoPreview>
    </DemoSection>
    <DemoSection title="Dismissible tags" description="The remove button is the only interactive part of a tag.">
      <DemoPreview className="demo-component-row">
        {topics.map((topic, index) => <AppTag color={colors[index + 1]} dismissLabel={`Remove ${topic}`} key={topic} onDismiss={() => setTopics((current) => current.filter((item) => item !== topic))}>{topic}</AppTag>)}
        {topics.length === 0 ? <span className="demo-note">All tags removed.</span> : null}
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
