import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../../server/src/server'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005/api/trpc'

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
