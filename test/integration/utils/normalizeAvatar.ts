import { components } from '../../../openapi/schema'

type Avatar = components['schemas']['Avatar']

// Remove URL so that we can do comparisons in tests
const normalizeAvatar = (avatar: Avatar) => ({
  name: avatar.name
})

export default normalizeAvatar
