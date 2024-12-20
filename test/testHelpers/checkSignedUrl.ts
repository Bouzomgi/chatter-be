import axios from 'axios'

async function isS3SignedUrlValid(url: string) {
  try {
    await axios.head(url)
    return true
  } catch {
    return false
  }
}

export default isS3SignedUrlValid
