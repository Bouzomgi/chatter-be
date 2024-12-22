import express from 'express'

import { default as postLogoutRouter } from '@src/routes/authRoutes/postLogout'
import { default as postLoginRouter } from './postLogin'
import { default as postRegisterRouter } from './postRegister'

const router = express.Router()

router.use(postLoginRouter)
router.use(postRegisterRouter)
router.use(postLogoutRouter)

export default router
