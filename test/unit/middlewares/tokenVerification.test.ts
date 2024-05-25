import { verifyToken } from '../../../src/middlewares/tokenVerification'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(() => ({ userId: '1' }) as JwtPayload)
}))

describe('verifyToken', () => {
  it('should successfully verify a valid authorization token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer mocked-token'
      }
    } as Request
    const res = {} as Response
    const next = jest.fn()

    await verifyToken(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should fail if an authorization token is not found', () => {
    const req = {
      headers: {}
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response

    const next = jest.fn()

    verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
    expect(next).not.toHaveBeenCalled()
  })

  it('should fail if the JWT cannot be validated', () => {
    const req = {
      headers: {}
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response

    ;(jwt.verify as jest.Mock).mockResolvedValue('invalid jwt')

    const next = jest.fn()

    verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
    expect(next).not.toHaveBeenCalled()
  })
})
