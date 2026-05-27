const CACHE = 'juliacal-v1'
const SHELL = ['/', '/manifest.json', '/icon.svg']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)))
})

self.addEventListener('fetch', e => {
  // 只缓存同源请求，API 请求走网络优先
  const url = new URL(e.request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      return cached || fetched
    })
  )
})
