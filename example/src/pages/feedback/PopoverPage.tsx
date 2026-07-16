import { useRef, useState } from 'react'
import { Info, MoreHorizontal } from 'lucide-react'
import {
  AppButton,
  AppIconButton,
  AppPopover,
  AppSelect,
  AppTextBox,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const priorityOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
]

export function PopoverPage() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return <DemoPage>
    <DemoSection title="Supporting content">
      <DemoPreview className="demo-component-row">
        <AppPopover placement="bottom-start" trigger={<AppButton>View details</AppButton>}>
          <strong>Lightweight details</strong>
          <p>This text stays close to its trigger without blocking the page.</p>
        </AppPopover>
        <AppPopover placement="top" trigger={<AppButton>Top</AppButton>}>
          Positioning flips or shifts near viewport edges.
        </AppPopover>
        <AppPopover
          placement="right"
          trigger={<AppIconButton ariaLabel="Open details" icon={<MoreHorizontal />} />}
        >
          <p>Icon buttons work as triggers.</p>
        </AppPopover>
      </DemoPreview>
      <p className="demo-note">
        Controls inside a popover support normal focus, typing, and clicks. Only an outside click or
        Escape dismisses the popover. Keep it open while scrolling or resizing to verify that it
        continues to follow its trigger.
      </p>
    </DemoSection>

    <DemoSection title="Interactive popover">
      <DemoPreview className="demo-component-row">
        <AppPopover
          ariaLabel="Quick edit"
          initialFocusRef={inputRef}
          matchTriggerWidth
          trigger={<AppButton>Quick edit</AppButton>}
        >
          <div className="demo-form-stack">
            <AppTextBox placeholder="Note" ref={inputRef} />
            <AppSelect defaultValue="normal" options={priorityOptions} />
            <AppButton appearance="primary">Save</AppButton>
          </div>
        </AppPopover>
        <AppPopover
          onOpenChange={setOpen}
          open={open}
          trigger={<AppButton icon={<Info />}>Controlled</AppButton>}
        >
          Controlled popover state.
        </AppPopover>
      </DemoPreview>
    </DemoSection>

    <DemoSection title="Popover compared with Dialog">
      <p className="demo-note">
        <strong>Popover is non-modal:</strong> it keeps the surrounding page available for supporting
        information and compact edits. <strong>Dialog is modal:</strong> use it when a decision or
        workflow must hold attention and block background interaction.
      </p>
      <p className="demo-note">
        Use MenuFlyout for commands, TeachingTip for guided instruction, and Tooltip for a short hint.
      </p>
    </DemoSection>
  </DemoPage>
}
