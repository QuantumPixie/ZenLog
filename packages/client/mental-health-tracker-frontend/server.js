import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// Proxy middleware config
const apiProxy = createProxyMiddleware('/api', {
  target: process.env.VITE_BACKEND_URL || 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // remove /api prefix when forwarding to backend
  },
  logLevel: 'debug'
})

//  proxy middleware
app.use('/api', apiProxy)

// Serve static files
app.use(express.static(join(__dirname, 'dist')))

// Handle SPA routing
app.get('*', (request, response) => {
  response.sendFile(join(__dirname, 'dist', 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  console.log(
    `Proxying /api requests to: ${process.env.VITE_BACKEND_URL || 'http://localhost:3005'}`
  )
})
