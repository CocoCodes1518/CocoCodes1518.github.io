import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

function vitePluginStorageProxy(): Plugin {
  return {
    name: 'manus-storage-proxy',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/manus-storage', async (req, res) => {
        const key = req.url?.replace(/^\//, '')
        if (!key) {
          res.writeHead(400, { 'Content-Type': 'text/plain' })
          res.end('Missing storage key')
          return
        }
        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || '').replace(/\/+$/, '')
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY
        if (!forgeBaseUrl || !forgeKey) {
          res.writeHead(500, { 'Content-Type': 'text/plain' })
          res.end('Storage proxy not configured')
          return
        }
        try {
          const forgeUrl = new URL('v1/storage/presign/get', forgeBaseUrl + '/')
          forgeUrl.searchParams.set('path', key)
          const forgeResp = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` },
          })
          if (!forgeResp.ok) {
            res.writeHead(502, { 'Content-Type': 'text/plain' })
            res.end('Storage backend error')
            return
          }
          const { url } = await forgeResp.json() as { url: string }
          if (!url) {
            res.writeHead(502, { 'Content-Type': 'text/plain' })
            res.end('Empty signed URL')
            return
          }
          res.writeHead(307, { Location: url, 'Cache-Control': 'no-store' })
          res.end()
        } catch {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
          res.end('Storage proxy error')
        }
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), vitePluginStorageProxy()],
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
})
