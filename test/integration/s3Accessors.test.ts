import { getAvatar, getDefaultAvatars } from '../../src/storage/s3Accessors'

describe('Get avatar', () => {
  it('can get a URL to an avatar', async () => {
    const knownAvatarName = 'avatar1'
    const avatarDetails = await getAvatar(knownAvatarName)

    // Verify that the returned details contain the correct name and a valid URL
    expect(avatarDetails).toHaveProperty('name', knownAvatarName)
    expect(avatarDetails).toHaveProperty('url')
  })
})

describe('Get default avatars', () => {
  it('can get the url and name of all default avatars', async () => {
    const allAvatars = await getDefaultAvatars()

    // There are 9 default avatars in total
    expect(allAvatars).toHaveLength(9)
  })
})
