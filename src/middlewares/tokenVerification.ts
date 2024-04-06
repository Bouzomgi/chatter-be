import { StatusCodes } from 'http-status-codes'
import env from '../config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthedRequest extends Request {
  userId: number
}

// TODO: Add validator
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error('Cannot find auth header')

    const decoded = await jwt.verify(token, env.TOKEN_SECRET)
    ;(req as AuthedRequest).userId = (decoded as JwtPayload).userId
    return next()
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })
  }
}
