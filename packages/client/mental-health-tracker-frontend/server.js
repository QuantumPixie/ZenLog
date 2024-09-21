import express from 'express'
import { serveStatic } from 'express'
import { join } from 'path'

const app = express()

app.use(serveStatic(join(__dirname, 'dist')))

app.get('*', (request, response) => {
  response.sendFile(join(__dirname, 'dist', 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
