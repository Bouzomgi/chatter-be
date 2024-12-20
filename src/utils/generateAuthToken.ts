import jwt from 'jsonwebtoken'
import env from '../config'

const generateAuthToken = (userId: number) =>
  jwt.sign(
    {
      userId: userId
    },
    env.TOKEN_SECRET,
    { expiresIn: '30h' }
  )

export default generateAuthToken
