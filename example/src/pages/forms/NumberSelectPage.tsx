import { useState } from 'react'
import { AppField, AppNumberBox, AppSelect } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const courses = [{ value: 'python', label: 'Python' }, { value: 'visual', label: 'Visual coding' }, { value: 'archived', label: 'Archived course', disabled: true }]

export function NumberSelectPage() {
  const [duration, setDuration] = useState<number | null>(45)
  const [evenValue, setEvenValue] = useState<number | null>(2)
  const [course, setCourse] = useState('python')
  return <DemoPage><DemoSection title="Number boxes"><DemoPreview className="demo-component-row"><AppNumberBox max={180} min={1} onValueChange={setDuration} step={5} value={duration} /><AppNumberBox allowEmpty defaultValue={null} placeholder="Empty" /><AppNumberBox defaultValue={1.5} precision={1} step={0.1} /><AppNumberBox defaultValue={30} disabled /><AppNumberBox aria-label="Even values only" onValueChange={(next) => { if (next == null || next % 2 === 0) setEvenValue(next) }} value={evenValue} /></DemoPreview><p className="demo-note">Step buttons keep the input focused and apply pending text once. The final controlled example accepts only even values and restores rejected edits.</p></DemoSection><DemoSection title="Select controls"><DemoPreview className="demo-form-stack"><AppSelect onValueChange={setCourse} options={courses} value={course} /><AppSelect options={courses} placeholder="Choose a course" /><AppSelect invalid options={courses} placeholder="Required" /><AppSelect disabled options={courses} value="python" /><AppField id="duration" label="Lesson duration" orientation="horizontal"><AppNumberBox max={180} min={15} step={15} defaultValue={60} /></AppField><AppField id="course-select" label="Course" orientation="horizontal"><AppSelect name="course" options={courses} defaultValue="python" /></AppField></DemoPreview></DemoSection></DemoPage>
}
