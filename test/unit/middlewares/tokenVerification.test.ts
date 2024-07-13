import { verifyToken } from '../../../src/middlewares/tokenVerification'
import { StatusCodes } from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

// Mock the jsonwebtoken module
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}))

describe('verifyToken', () => {
  // Helper function to create mock Request, Response, and NextFunction
  const createMocks = () => {
    const req = {} as Request
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    const next = jest.fn() as NextFunction
    return { req, res, next }
  }

  beforeEach(() => {
    jest.resetAllMocks() // Reset mocks before each test
  })

  it('should successfully verify a valid authorization token', async () => {
    const { req, res, next } = createMocks()
    req.cookies = { 'auth-token': 'abc' }
    ;(jwt.verify as jest.Mock).mockResolvedValueOnce({
      userId: 1
    } as JwtPayload)

    await verifyToken(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should fail if an authorization token is not found', async () => {
    const { req, res, next } = createMocks()

    await verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(next).not.toHaveBeenCalled()
  })

  it('should fail if the JWT cannot be validated', async () => {
    const { req, res, next } = createMocks()
    req.cookies = { 'auth-token': 'abc' }
    ;(jwt.verify as jest.Mock).mockRejectedValueOnce(new Error('invalid jwt'))

    await verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(next).not.toHaveBeenCalled()
  })
})
