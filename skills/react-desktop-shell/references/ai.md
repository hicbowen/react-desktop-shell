# Conversation and AI UI

Import from `react-desktop-shell/ai`. The recipe uses aggregate `style.css`
to cover the composer's nested form control as well as AI surfaces. Render
below the application's shell or provider. These are
presentation and interaction components; they do not choose a model, call an
AI service, run tools, or modify files.

## Message and composer recipe

Adapted from `example/src/pages/actions/ConversationPage.tsx`, with demo timers
removed and transport-dependent work exposed as application callbacks.

```tsx
import { useState } from 'react'
import {
  AppAiComposer,
  AppAiMarkdown,
  AppConversationThread,
  AppConversationViewport,
  type AppAiRunStatus,
} from 'react-desktop-shell/ai'
import 'react-desktop-shell/style.css'

type TextMessage = { id: string; role: 'user' | 'assistant'; text: string }

export function ConversationPanel({
  messages,
  runStatus,
  send,
  cancel,
}: {
  messages: readonly TextMessage[]
  runStatus: AppAiRunStatus
  send: (prompt: string) => void
  cancel: () => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <div>
      <AppConversationViewport style={{ height: 420 }}>
        <AppConversationThread
          messages={messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: <AppAiMarkdown content={message.text} />,
          }))}
        />
      </AppConversationViewport>
      <AppAiComposer
        appearance="surface"
        value={draft}
        onValueChange={setDraft}
        runStatus={runStatus}
        onCancel={cancel}
        onSubmit={send}
      />
    </div>
  )
}
```

The application implements `send`/`cancel`, updates messages and `runStatus`,
and handles transport errors. Streaming updates should preserve the message
ID while updating its content. Do not append a new message for every token.

## Composition details

- `AppConversationThread.messages` items require `id`, `role`, and React
  `content`; they are not raw chat API request messages. Convert application
  records at the UI boundary.
- `AppAiMarkdown` takes the string in `content`, not `children` or `markdown`.
  `highlightCode={false}` disables syntax highlighting. Code-copy callbacks
  can connect to application feedback.
- `AppConversationViewport` owns following output and preserving the reading
  position. Give it a bounded height. Use `hasMore`, `loadingOlder`, and
  `onLoadOlder` to request older records, then prepend them in application
  state. Avoid adding an unconditional scroll-to-bottom effect that fights
  the user's reading position.
- The composer uses `value` / `onValueChange` and `onSubmit(prompt)`.
  Controlled clearing depends on updating the supplied value. Read
  `clearOnSubmit` before adding a second clearing path.
- `appearance="surface"` provides its own surface; `embedded` suits a parent
  that already supplies a border/elevation, such as a side pane or QuickAsk.
  `header`, `toolbarStart`, and `toolbarEnd` are React slots for host controls.
- `AppAiMessageActions` reports copy, retry, edit, and feedback actions; the
  application implements them. `metaVisibility` coordinates message metadata
  visibility; prefer it over deprecated `timestampVisibility`.

## Keep lifecycle states separate

| Lifecycle                             | Components                            | Representative statuses                                                                                                               |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Current response/run                  | `AppAiComposer`, `AppAiRunIndicator`  | `idle`, `thinking`, `responding`, `searching`, `using-tool`, `awaiting-approval`, `awaiting-review`, `completed`, `error`, `canceled` |
| One tool call                         | `AppToolCallCard`                     | `awaiting-approval`, `running`, `completed`, `rejected`, `canceled`, `error`                                                          |
| Activity without an approval decision | `AppToolActivity`, `AppToolCallGroup` | `running`, `completed`, `canceled`, `error`                                                                                           |
| Proposed changes                      | `AppChangeReviewCard`                 | `awaiting-review`, `applying`, `applied`, `rejected`, `error`                                                                         |

Use `AppToolCallCard` when the product needs approve/reject actions;
`AppToolActivity` cannot represent an approval decision. Approval and change
application callbacks express UI intent. They do not themselves execute a
tool or persist changes. Drive status updates from actual application results.

Change-review files have `id`, `path`, optional summary/counts, and React
`diff` content. The card is a review surface, not a patch parser or a full
source editor. Keep the tool's approval policy and backend responsibilities
in the consuming product; the example's workflow is one composition option.
