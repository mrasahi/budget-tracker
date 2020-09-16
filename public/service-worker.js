self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('budget-cache-v1').then(cache => {
            console.log('Opened cache')
            return cache.addAll([
                '/',
                '/db.js',
                '/index.html',
                '/manifest.json',
                '/index.js',
                '/styles.css',
                '/icons/icon-192x192.png',
                '/icons/icon-512x512.png'
            ])
        })
    )
})

self.addEventListener('fetch', event => {

    if (event.request.url.includes('/api/')) {
        return
    }

    event.respondWith(
        fetch(event.request).catch(err => {
            return caches.match(event.request).then(res => {
                if (res) {
                    return res
                }
                else if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/')
                }
            })
        })
    )
})