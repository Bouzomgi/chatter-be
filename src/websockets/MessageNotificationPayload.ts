import { components } from '@openapi/schema'

type Message = components['schemas']['Message']

type MessageNotificationPayload = {
  conversationId: number
  threadId: number
  members: number[]
  message: Message
}

export default MessageNotificationPayload
