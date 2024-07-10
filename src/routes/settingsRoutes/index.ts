import express from 'express'

import { default as getAvatars } from './getDefaultAvatars'
import { default as postSetAvatars } from './postSetSettings'

const router = express.Router()

router.use(getAvatars)
router.use(postSetAvatars)

export default router
