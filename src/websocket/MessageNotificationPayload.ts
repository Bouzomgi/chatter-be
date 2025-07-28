import { components } from '@openapi/schema'

type Message = components['schemas']['Message']

export type MessageNotificationPayload = {
  conversationId: number
  threadId: number
  members: number[]
  message: Message
}
