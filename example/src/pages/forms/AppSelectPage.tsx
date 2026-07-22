import { useState } from 'react'
import { AppField, AppSelect } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const courses = [{ value: 'python', label: 'Python' }, { value: 'visual', label: 'Visual coding' }, { value: 'archived', label: 'Archived course', disabled: true }]

export function AppSelectPage() {
  const [course, setCourse] = useState('python')
  return <DemoPage><DemoSection title="Select controls"><DemoPreview className="demo-form-stack"><AppSelect onValueChange={setCourse} options={courses} value={course} /><AppSelect options={courses} placeholder="Choose a course" /><AppSelect invalid options={courses} placeholder="Required" /><AppSelect disabled options={courses} value="python" /><AppField id="course-select" label="Course" orientation="horizontal"><AppSelect name="course" options={courses} defaultValue="python" /></AppField></DemoPreview></DemoSection></DemoPage>
}
