import { useState } from 'react'
import { Button, DatePicker, Input, Select, Switch } from 'antd'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AntdThemePage() {
  const [enabled, setEnabled] = useState(true)
  return <DemoPage><DemoSection title="Ant Design theme bridge" description="createAntdTheme maps the shell's light or dark mode into an Ant Design ConfigProvider theme."><DemoPreview><div className="demo-antd"><Input placeholder="Input" /><Select defaultValue="one" options={[{ value: 'one', label: 'Option one' }, { value: 'two', label: 'Option two' }]} /><DatePicker /><span><Switch checked={enabled} onChange={setEnabled} /> Enabled</span><Button type="primary">Primary action</Button></div></DemoPreview></DemoSection></DemoPage>
}
