import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'

const logger = createLogger()
const originalWarn = logger.warn
logger.warn = (msg, options) => {
  if (msg.includes('TOLERATED_TRANSFORM') || msg.includes('Big integer literals')) return
  originalWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'chrome78'
  },
  ssgOptions: {
    dirStyle: 'nested'
  }
})