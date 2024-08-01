import express from 'express'

import { default as patchReadThreadRouter } from './patchReadThread'
import { default as getChatsRouter } from './getChats'
import { default as getChatUsersDetails } from './getChatUsersDetails'
import { default as getUserHeadsRouter } from './getUserHeads'
import { default as postMessageRouter } from './postMessage'

const router = express.Router()

router.use(patchReadThreadRouter)
router.use(getChatsRouter)
router.use(getChatUsersDetails)
router.use(getUserHeadsRouter)
router.use(postMessageRouter)

export default router
