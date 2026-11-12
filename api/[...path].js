// Vercel serverless catch-all — /api/<anything> is served by the Express app.
import { app } from '../server/src/app.js'

export default app
