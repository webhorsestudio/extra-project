/**
 * Clear Next.js cache
 * Run this if you're having module resolution issues
 */

const fs = require('fs')
const path = require('path')

const cacheDir = path.join(process.cwd(), '.next')

if (fs.existsSync(cacheDir)) {
  console.log('Clearing Next.js cache...')
  fs.rmSync(cacheDir, { recursive: true, force: true })
  console.log('✅ Cache cleared successfully')
} else {
  console.log('No cache directory found')
}

console.log('Please restart your development server with: npm run dev')
