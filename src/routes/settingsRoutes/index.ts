import express from 'express'

import { default as getAvatarsRouter } from './getDefaultAvatars'
import { default as postSetAvatarsRouter } from './postSetSettings'

const router = express.Router()

router.use(getAvatarsRouter)
router.use(postSetAvatarsRouter)

export default router
