import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../../server/src/server.ts'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return ''
  }
  if (import.meta.env.VITE_BACKEND_URL) {
    // SSR should use backend URL
    return import.meta.env.VITE_BACKEND_URL
  }
  // fallback to localhost
  return `http://localhost:${process.env.PORT ?? 3005}`
}

const url = `${getBaseUrl()}/api/trpc`

console.log('TRPC URL:', url)

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include'
        })
      }
    })
  ]
})
