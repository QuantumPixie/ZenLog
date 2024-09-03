import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: `${__dirname}/../.env` })

import('./server.js')
