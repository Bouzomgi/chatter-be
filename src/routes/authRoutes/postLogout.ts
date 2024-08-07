import express from 'express'
import { PathMethodResponse } from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()

router.post('/logout', (_, res: PathMethodResponse<'/logout'>) =>
  res
    .status(StatusCodes.OK)
    .cookie('auth-token', 'abc', {
      expires: new Date(0)
    })
    .json({
      message: 'User was logged out'
    })
)

export default router
