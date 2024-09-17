export default async function globalSetup() {
  process.env.VITE_BACKEND_URL = 'http://localhost:3005/api/trpc'
  console.log('VITE_BACKEND_URL set to:', process.env.VITE_BACKEND_URL)
}
