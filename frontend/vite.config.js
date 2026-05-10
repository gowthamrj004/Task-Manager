import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Railway backend root (https://….up.railway.app). If unset, local API default.
  const proxyTarget =
    (env.VITE_API_PROXY_TARGET || '').trim() || 'http://127.0.0.1:5001'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          configure(proxy) {
            proxy.on('error', (err) => {
              console.error('[vite proxy /api] error — is VITE_API_PROXY_TARGET correct?', err.message);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              if (proxyRes.statusCode >= 400) {
                console.warn('[vite proxy]', req.method, req.url, '→', proxyRes.statusCode, proxyTarget);
              }
            });
          },
        },
      },
    },
  }
})
