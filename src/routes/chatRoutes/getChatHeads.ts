import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import { pullChatHeads } from '../../queries/pullChatHeads'
import AuthedRequest from '../../middlewares/authedRequest'

const router = express.Router()

router.get(
  '/chatheads',
  async (
    req: PathMethodRequest<'/authed/chatheads', 'get'>,
    res: PathMethodResponse<'/authed/chatheads'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/chatheads', 'get'>

      const chatheads = await pullChatHeads(authedReq.userId)
      return res.status(StatusCodes.OK).json(chatheads ? chatheads : [])
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get chat heads' })
    }
  }
)

export default router
