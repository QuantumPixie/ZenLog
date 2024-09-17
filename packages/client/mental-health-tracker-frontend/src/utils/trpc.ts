import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../../server/src/server'

const backendUrl =
  typeof import.meta.env !== 'undefined' && import.meta.env.VITE_BACKEND_URL
    ? import.meta.env.VITE_BACKEND_URL
    : 'http://localhost:3005/api/trpc'

console.log('Backend URL:', backendUrl)

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: backendUrl,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include'
        })
      }
    })
  ]
})
