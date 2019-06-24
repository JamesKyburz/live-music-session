/* eslint-env serviceworker */

const { CACHE_KEY } = process.env

self.addEventListener('install', async event => {
  event.waitUntil(self.skipWaiting())
  try {
    const keys = await self.caches.keys()
    for (const key of keys) {
      if (key !== CACHE_KEY) {
        await self.caches.delete(key)
      }
    }
  } catch (err) {
    console.error('failed to delete old caches', err)
  }
})

self.addEventListener('activate', event =>
  event.waitUntil(
    self.clients
      .claim()
      .catch(err => console.error('failed to claim clients', err))
  )
)

self.addEventListener('fetch', event => {
  if (self.location.hostname === 'localhost' && !process.env.CACHE_LOCAL) {
    return
  }
  event.respondWith(cacheResponse(event.request))
})

async function cacheResponse (request) {
  const cache = await self.caches.open(CACHE_KEY)
  const res = await cache.match(request.url)
  if (res) return res

  return nohit(cache)

  function nohit (cache) {
    try {
      return cacheAsset(cache)
    } catch (err) {
      console.warn(`error caching ${request.url}`, err)
      return self.fetch(request)
    }
  }

  async function cacheAsset (cache) {
    console.warn(`no cache hit for ${request.url}`)
    const res = await self.fetch(request, { cache: 'no-cache' })
    if (res.status < 300) {
      try {
        await cache.put(request, res.clone())
      } catch (err) {
        console.warn(`failed to cache ${request.url}`, err)
      }
    }
    return res
  }
}
