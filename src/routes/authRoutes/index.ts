import express from 'express'

import { default as postLoginRouter } from './postLogin'
import { default as postRegisterRouter } from './postRegister'

const router = express.Router()

router.use(postLoginRouter)
router.use(postRegisterRouter)

export default router
