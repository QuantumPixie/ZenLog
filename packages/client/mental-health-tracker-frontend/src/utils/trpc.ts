import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../../server/src/server.ts'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return import.meta.env.VITE_BACKEND_URL
  }
  // SSR should use the full URL
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005/api/trpc'
}

const url = getBaseUrl()

console.log('TRPC URL:', url)

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url,
      fetch(url, options) {
        console.log('TRPC request:', url, options)
        return fetch(url, {
          ...options,
          credentials: 'include'
        })
          .then(async (response) => {
            console.log('TRPC response:', response.status, response.statusText)
            if (!response.ok) {
              const errorText = await response.text()
              console.error('TRPC request failed:', response.status, response.statusText)
              console.error('Response text:', errorText)
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }
            return response
          })
          .catch((error) => {
            console.error('TRPC fetch error:', error)
            throw error
          })
      }
    })
  ]
})
