import { AppField, AppSelect, AppTextBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppFieldPage() {
  return <DemoPage><DemoSection title="Field structure"><DemoPreview className="demo-form-stack"><AppField description="Used in feedback and learning plans" id="student-name" label="Student name" required><AppTextBox /></AppField><AppField id="course" label="Course" labelWidth={140} orientation="horizontal"><AppSelect defaultValue="python" options={[{ value: 'python', label: 'Python' }, { value: 'visual-coding', label: 'Visual coding' }]} /></AppField><AppField error="Enter a valid email address" id="email" label="Email"><AppTextBox type="email" /></AppField><AppField disabled id="locked" label="Managed value"><AppTextBox value="Administrator" readOnly /></AppField></DemoPreview></DemoSection></DemoPage>
}
