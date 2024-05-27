import express from 'express'

import { default as deleteReadThreadRouter } from './deleteReadThread'
import { default as getChatHeadsRouter } from './getChatHeads'
import { default as getMessagesRouter } from './getMessages'
import { default as getUserHeadsRouter } from './getUserHeads'
import { default as postMessageRouter } from './postMessage'

const router = express.Router()

router.use(deleteReadThreadRouter)
router.use(getChatHeadsRouter)
router.use(getMessagesRouter)
router.use(getUserHeadsRouter)
router.use(postMessageRouter)

export default router
