import express from 'express'

import { default as getAvatarsRouter } from './getDefaultAvatars'
import { default as postLogoutRouter } from './postLogout'
import { default as postSetAvatarsRouter } from './postSetSettings'

const router = express.Router()

router.use(getAvatarsRouter)
router.use(postLogoutRouter)
router.use(postSetAvatarsRouter)

export default router
