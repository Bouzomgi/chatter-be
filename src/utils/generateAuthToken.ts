import env from '@src/config'
import jwt from 'jsonwebtoken'

const generateAuthToken = (userId: number) =>
  jwt.sign(
    {
      userId: userId
    },
    env.TOKEN_SECRET,
    { expiresIn: '30h' }
  )

export default generateAuthToken
