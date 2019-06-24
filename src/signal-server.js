const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: process.env.PORT })

wss.on('connection', (ws, req) => {
  const [room, peerId] = req.url
    .split('/')
    .slice(1)
    .map(decodeURIComponent)

  if (!room || !peerId) return ws.close()

  ws.room = room
  ws.peerId = peerId

  ws.on('message', data => {
    try {
      const { type, to } = JSON.parse(data)
      if (type) {
        const clients = to
          ? wss.clients.filter(client => client.peerId === to)
          : wss.clients
        for (const client of clients) {
          if (client === ws) continue
          if (client.room !== ws.room) continue
          client.send(data)
        }
      }
    } catch (e) {}
  })
})
