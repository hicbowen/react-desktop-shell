import type {
  AppConversationMessageItem,
  AppConversationMessageRole,
  AppToolApprovalStatus,
} from '../../../../src'

export interface DemoTextMessage {
  id: string
  role: Exclude<AppConversationMessageRole, 'tool'>
  text: string
  timestamp?: string
  timestampDateTime?: string
}

export interface DemoToolMessage {
  id: string
  role: 'tool'
  status: AppToolApprovalStatus
}

export type DemoMessage = DemoTextMessage | DemoToolMessage

export const initialChatMessages: DemoTextMessage[] = [
  {
    id: 'chat-user-1',
    role: 'user',
    text: 'What should we review in this thread?',
    timestamp: '10:24',
    timestampDateTime: '2026-08-13T10:24:00+08:00',
  },
  {
    id: 'chat-assistant-1',
    role: 'assistant',
    text: 'The current thread is ready. Ask a follow-up and the host will append the next turn.',
    timestamp: '10:24',
    timestampDateTime: '2026-08-13T10:24:10+08:00',
  },
]

export const initialConversationMessages: DemoTextMessage[] = [
  {
    id: 'viewport-user-1',
    role: 'user',
    text: 'Can we keep this conversation on the page?',
    timestamp: '10:30',
    timestampDateTime: '2026-08-13T10:30:00+08:00',
  },
  {
    id: 'viewport-assistant-1',
    role: 'assistant',
    text: 'Yes. The page owns the thread, while the viewport handles follow and history navigation.',
    timestamp: '10:30',
    timestampDateTime: '2026-08-13T10:30:08+08:00',
  },
  {
    id: 'viewport-assistant-2',
    role: 'assistant',
    text: 'Scroll up to pause follow mode, then use Jump to latest when you are ready to return.',
    timestamp: '10:31',
    timestampDateTime: '2026-08-13T10:31:00+08:00',
  },
]

export const initialApprovalMessages: DemoMessage[] = [
  {
    id: 'approval-assistant-1',
    role: 'assistant',
    text: 'The assistant needs confirmation before it can save the meeting summary.',
  },
  { id: 'approval-tool-1', role: 'tool', status: 'pending' },
]

export function cloneTextMessages(
  messages: readonly DemoTextMessage[],
): DemoTextMessage[] {
  return messages.map((message) => ({ ...message }))
}

export function toConversationMessages(
  messages: readonly DemoTextMessage[],
  t: (value: string) => string,
): AppConversationMessageItem[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: <p>{t(message.text)}</p>,
    timestamp: message.timestamp ? t(message.timestamp) : undefined,
    timestampDateTime: message.timestampDateTime,
  }))
}
