import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt, { JwtPayload } from 'jsonwebtoken'
import env from '../config'

interface AuthedRequest extends Request {
  userId: number
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies['auth-token']

    const decoded = await jwt.verify(token, env.TOKEN_SECRET)
    ;(req as AuthedRequest).userId = (decoded as JwtPayload).userId
    return next()
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })
  }
}
