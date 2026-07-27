import { useState } from 'react'
import { AppField, AppSelect } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const courses = [{ value: 'python', label: 'Python' }, { value: 'visual', label: 'Visual coding' }, { value: 'archived', label: 'Archived course', disabled: true }]
const manyOptions = Array.from({ length: 120 }, (_, index) => {
  const number = index + 1
  return {
    value: `option-${number}`,
    label: `Option ${number.toString().padStart(3, '0')}`,
  }
})

export function AppSelectPage() {
  const [course, setCourse] = useState('python')
  return <DemoPage><DemoSection title="Select controls"><DemoPreview className="demo-form-stack"><AppSelect onValueChange={(value) => value && setCourse(value)} options={courses} value={course} /><AppSelect clearable defaultValue="python" options={courses} placeholder="Choose a course" /><AppSelect options={courses} placeholder="Choose a course" /><AppField error="Required" id="required-course-select" label="Course" required><AppSelect options={courses} placeholder="Choose a course" /></AppField><AppSelect disabled options={courses} value="python" /><AppField id="course-select" label="Course" orientation="horizontal"><AppSelect name="course" options={courses} defaultValue="python" /></AppField></DemoPreview></DemoSection><DemoSection title="Long option list" description="120 options for checking picker positioning, scrolling, and viewport boundaries."><DemoPreview className="demo-form-stack"><AppSelect defaultValue="option-60" options={manyOptions} /></DemoPreview></DemoSection></DemoPage>
}
