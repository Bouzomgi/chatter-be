import express from 'express'
const app = express()

// MIDDLEWARES
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

export default app
