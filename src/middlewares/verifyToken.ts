import { StatusCodes } from 'http-status-codes'
import env from '../config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthedRequest extends Request {
  userId: number
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token)
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })

  try {
    const decoded = await jwt.verify(token, env.TOKEN_SECRET)
    ;(req as AuthedRequest).userId = (decoded as JwtPayload).userId

    return next()
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })
  }
}
