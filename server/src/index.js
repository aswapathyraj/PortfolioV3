import fs from 'node:fs'
import { app } from './app.js'
import { config } from './config.js'

// Ensure the media directory exists before serving uploads.
const uploadDir = config.storageLocalDir.replace(/^\.\//, '')
fs.mkdirSync(uploadDir, { recursive: true })

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[portfolio-api] listening on http://localhost:${config.port}`)
})

// Let a unit-test harness import app without opening a port.
export default app