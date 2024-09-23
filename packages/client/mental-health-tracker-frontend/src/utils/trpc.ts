import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../../server/src/server.ts'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return '/api/trpc'
  }
  // SSR should use the full URL
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005/api/trpc'
}

const url = `${getBaseUrl()}`

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
      }
    })
  ]
})
