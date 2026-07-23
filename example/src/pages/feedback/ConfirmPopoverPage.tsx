import { useState } from 'react'
import { AppButton, AppConfirmPopover } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppConfirmPopoverPage() {
  const [result, setResult] = useState('No action yet')

  return (
    <DemoPage>
      <DemoSection
        description="Keep confirmation close to a small, local action without blocking the rest of the page."
        title="Local confirmation"
      >
        <DemoPreview className="demo-component-row">
          <AppConfirmPopover
            confirmAppearance="danger"
            confirmText="Delete"
            description="This removes the item from the current list."
            onConfirm={() => setResult('Item deleted')}
            title="Delete this item?"
            trigger={<AppButton appearance="danger">Delete item</AppButton>}
          />
          <AppConfirmPopover
            description="The confirmation remains open while the request is running."
            onConfirm={async () => {
              await new Promise((resolve) => setTimeout(resolve, 600))
              setResult('Item archived')
            }}
            title="Archive this item?"
            trigger={<AppButton>Archive item</AppButton>}
          />
          <span>Last result: {result}</span>
        </DemoPreview>
      </DemoSection>
      <DemoSection
        description="Use MessageBox or Dialog when the decision is global, highly destructive, or requires more information."
        title="Scope"
      >
        <p className="demo-note">
          ConfirmPopover is non-modal and intended for a single nearby action.
        </p>
      </DemoSection>
    </DemoPage>
  )
}
