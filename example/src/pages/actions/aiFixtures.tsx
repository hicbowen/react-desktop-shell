import type {
  AppConversationMessage,
  AppConversationMessageRole,
  AppToolApprovalStatus,
} from '../../../../src'

export interface DemoTextMessage {
  id: string
  role: Exclude<AppConversationMessageRole, 'tool'>
  text: string
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
  },
  {
    id: 'chat-assistant-1',
    role: 'assistant',
    text: 'The current thread is ready. Ask a follow-up and the host will append the next turn.',
  },
]

export const initialConversationMessages: DemoTextMessage[] = [
  {
    id: 'viewport-user-1',
    role: 'user',
    text: 'Can we keep this conversation on the page?',
  },
  {
    id: 'viewport-assistant-1',
    role: 'assistant',
    text: 'Yes. The page owns the thread, while the viewport handles follow and history navigation.',
  },
  {
    id: 'viewport-assistant-2',
    role: 'assistant',
    text: 'Scroll up to pause follow mode, then use Jump to latest when you are ready to return.',
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
): AppConversationMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: <p>{t(message.text)}</p>,
  }))
}
