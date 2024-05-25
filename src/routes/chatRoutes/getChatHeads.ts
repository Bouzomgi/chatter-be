import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { AuthedRequest } from '../../middlewares/tokenVerification'
import { validationResult } from 'express-validator'
import { pullChatHeads } from '../../queries/pullChatHeads'

const router = express.Router()

router.get('/chatheads', async (req, res) => {
  try {
    await validationResult(req).throw()

    const authedReq = req as AuthedRequest

    const chatheads = await pullChatHeads(authedReq.userId)
    return res.status(StatusCodes.OK).json(chatheads ? chatheads : [])
  } catch {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Could not get chat heads' })
  }
})

export default router
