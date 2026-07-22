import { useState } from 'react'
import { Mail, Search } from 'lucide-react'
import { AppField, AppTextBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppTextBoxPage() {
  const [name, setName] = useState('Ada')
  return <DemoPage><DemoSection title="Text boxes"><DemoPreview className="demo-form-stack"><AppTextBox placeholder="Plain input" /><AppTextBox clearable onChange={(event) => setName(event.target.value)} startIcon={<Search />} value={name} /><AppTextBox endIcon={<Mail />} placeholder="Email" type="email" /><AppTextBox invalid defaultValue="Invalid value" /><AppTextBox disabled value="Disabled" readOnly /><AppTextBox value="Read only" readOnly /><AppTextBox clearable defaultValue="secret" type="password" /><AppTextBox loading placeholder="Search while loading" type="search" /><AppField error="Enter a student name" id="student-input" label="Student"><AppTextBox invalid /></AppField></DemoPreview></DemoSection></DemoPage>
}
