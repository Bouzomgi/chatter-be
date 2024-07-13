import express from 'express'

import { default as postLoginRouter } from './postLogin'
import { default as postRegisterRouter } from './postRegister'
import { default as postLogoutRouter } from '../authRoutes/postLogout'

const router = express.Router()

router.use(postLoginRouter)
router.use(postRegisterRouter)
router.use(postLogoutRouter)

export default router
