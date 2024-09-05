import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '/Users/thuppertz/dev/thuppe-WD.3.3.5/lib/shared/types.ts';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3007/api/trpc',
      headers() {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});