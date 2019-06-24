import p2p from './p2p.js'
import track from './components/track.js'
import { audio, p } from './dom.js'

export default () => {
  const connections = {}
  return {
    chat: () => ({
      sendChatMessage (message) {
        const from = window.localStorage.getItem('player') || 'Unknown'
        const instrument = window.localStorage.getItem('instrument') || ''
        let sentCount = 0
        const messageText = `${from}${
          instrument ? ` (${instrument})` : ''
        } says: ${message}`
        for (const [, connection] of Object.entries(connections)) {
          if (!connection.messageChannel) continue
          if (connection.messageChannel.readyState === 'open') {
            connection.messageChannel.send(messageText)
            sentCount++
          }
        }
        const messages = window.document.querySelector('.messages')
        const sentMessage = p({
          className: 'message-received',
          textContent: sentCount
            ? messageText
            : `${message} wasn't sent because you're not connected to anyone`
        })
        messages.appendChild(sentMessage)
        if (!sentCount) {
          setTimeout(() => {
            sentMessage.classList.add('hidden')
          }, 10000)
        }
      }
    }),
    record: input => ({
      canRecord () {
        return !!input
      },
      onStop () {
        window.location.reload()
      },
      onRecord () {
        return async e => {
          p2p({
            stream: input,
            onMessage ({ data }) {
              const messages = window.document.querySelector('.messages')
              const received = p({
                className: 'message-received',
                textContent: data
              })
              if (!data.includes('says')) {
                setTimeout(() => {
                  received.classList.add('hidden')
                }, 5000)
              }
              messages.appendChild(received)
            },
            onConnectionStateChange (connection) {
              const key = connection.peerId.replace(/[^a-z0-9-]/g, '')
              const trackEl = window.document.querySelector(`.track.key-${key}`)
              if (!trackEl && connection.connectionState === 'connected') {
                connections[connection.peerId] = connection
                if (!connection.audio) {
                  const streams = connection.getRemoteStreams()
                  if (streams.length) {
                    connection.audio = audio({
                      srcObject: streams[0]
                    })
                    connection.audio.play().catch(console.error)
                  }
                }
                const tracks = window.document.querySelector('.slider')
                tracks.appendChild(
                  track({
                    title: connection.name || 'New musician',
                    key,
                    instrument: connection.instrument || 'Unknown instrument',
                    type: 'audio'
                  })
                )
              } else if (
                trackEl &&
                ['failed', 'disconnected', 'closed'].includes(
                  connection.connectionState
                )
              ) {
                if (connection.audio) {
                  connection.audio.pause()
                  connection.audio.currentTime = 0
                  connection.audio = null
                }
                trackEl.parentNode.removeChild(trackEl)
                const messages = window.document.querySelector('.messages')
                const disconnectedMessage = p({
                  className: 'message-received',
                  textContent: `${connection.name}${
                    connection.instrument ? ` (${connection.instrument})` : ''
                  } disconnected`
                })
                setTimeout(() => {
                  disconnectedMessage.classList.add('hidden')
                }, 5000)
                messages.appendChild(disconnectedMessage)
                delete connections[connection.peerId]
              }
              window.document.querySelector(
                '.connected-count'
              ).textContent = `Connected to ${
                Object.keys(connections).length
              } musician(s)`
            }
          })
          e.target.parentNode.querySelector('.stop').textContent = '■'
          e.target.parentNode.parentNode.classList.add('recording')
          const player = window.document.querySelector('.player')
          if (player) player.parentNode.removeChild(player)
        }
      }
    })
  }
}
