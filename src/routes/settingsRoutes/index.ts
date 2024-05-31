import express from 'express'

import { default as getAvatars } from './getAvatars'
import { default as postSetAvatars } from './postSetAvatar'

const router = express.Router()

router.use(getAvatars)
router.use(postSetAvatars)

export default router
