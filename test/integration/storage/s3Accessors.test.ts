import { getAvatar, getDefaultAvatars } from '../../../src/storage/s3Accessors'
import isS3SignedUrlValid from '../utils/checkSignedUrl'

describe('Get avatar', () => {
  it('can get a URL to an avatar', async () => {
    const knownAvatarName = 'avatars/default/avatar1.svg'
    const avatarDetails = await getAvatar(knownAvatarName)

    expect(avatarDetails.name).toBe(knownAvatarName)
    const avatarUrlValidity = await isS3SignedUrlValid(avatarDetails.url)
    expect(avatarUrlValidity).toBe(true)
  })
})

describe('Get default avatars', () => {
  it('can get the url and name of all default avatars', async () => {
    const allAvatars = await getDefaultAvatars()

    // There are 9 default avatars in total
    expect(allAvatars).toHaveLength(9)
  })
})
