import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const result = dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
if (result.error) {
  throw result.error
}

import('./server')
