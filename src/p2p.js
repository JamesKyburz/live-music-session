const connections = {}

let signal
let id

let name
let instrument

let DEBUG = window.localStorage.getItem('DEBUG')

export default async ({ stream, onConnectionStateChange, onMessage }) => {
  name = window.localStorage.getItem('player')
  instrument = window.localStorage.getItem('instrument')
  id = await createId()
  signal = signalConnection()

  dial()

  signal.onmessage = async ({ type, payload }) => {
    try {
      if (type === 'dial') {
        const { id: peerId, name, instrument } = payload
        const known = Object.keys(connections).includes(peerId)
        if (
          !known ||
          ['failed', 'disconnected', 'closed'].includes(known.connectionState)
        ) {
          const connection = peer({
            peerId,
            stream,
            onConnectionStateChange,
            onMessage
          })
          connection.name = name
          connection.instrument = instrument
          connections[peerId] = connection
          if (DEBUG) console.log('peer %s createOffer'.peerId)
          connection.messageChannel = connection.createDataChannel(peerId, {
            reliable: true
          })
          connection.messageChannel.onmessage = onMessage
          connection.messageChannel.onopen = () =>
            connection.messageChannel.send(
              `${connection.name}${
                connection.instrument ? ` (${connection.instrument})` : ''
              } connected`
            )
          await connection.setLocalDescription(await connection.createOffer())
        }
      } else if (type === 'offer') {
        const { offer, id: peerId, name, instrument } = payload
        if (
          connections[peerId] &&
          ['connecting', 'connected', 'new'].includes(
            connections[peerId].connectionState
          )
        ) {
          return
        }
        if (DEBUG) console.log('received offer from peer %s'.peerId)
        const connection = peer({
          peerId,
          stream,
          onConnectionStateChange,
          onMessage
        })
        connection.name = name
        connection.instrument = instrument
        connections[peerId] = connection
        await connection.setRemoteDescription(
          new window.RTCSessionDescription(offer)
        )
        if (DEBUG) console.log('peer %s createAnswer'.peerId)
        connection.ondatachannel = e => {
          connection.messageChannel = e.channel
          e.channel.onopen = () =>
            e.channel.send(`${connection.name} connected`)
          e.channel.onmessage = onMessage
        }
        await connection.setLocalDescription(await connection.createAnswer())
      } else if (type === 'answer') {
        const { answer, id: peerId, name, instrument } = payload
        const connection = connections[peerId]
        if (!connection || connection.remoteDescription) {
          return
        }
        connection.name = name
        connection.instrument = instrument
        await connection.setRemoteDescription(
          new window.RTCSessionDescription(answer)
        )
        if (DEBUG) console.log('peer %s received answer'.peerId)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

const configuration = {
  iceServers: [
    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
    { urls: 'stun:stun.l.google.com:19302' }
  ],
  sdpSemantics: 'unified-plan'
}

async function createId () {
  let id = window.sessionStorage.getItem('peerId')
  if (id) return id
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(100))
  const hash = await window.crypto.subtle.digest('SHA-512', randomBytes)
  id = 'sha512-' + window.btoa(String.fromCharCode(...new Uint8Array(hash)))
  window.sessionStorage.setItem('peerId', id)
  return id
}

function signalConnection () {
  const socket = () =>
    new window.WebSocket(
      `${process.env.SIGNAL_URL}${
        window.location.pathname
      }/${window.encodeURIComponent(id)}`
    )

  let messageHandler = f => f
  let ws

  const send = message => {
    if (ws && ws.readyState === window.WebSocket.OPEN) {
      if (DEBUG) console.log('>', JSON.stringify(message, null, 2))
      ws.send(JSON.stringify(message))
    } else {
      setTimeout(() => send(message), 1000)
    }
  }

  connect()

  return {
    send,
    set onmessage (handler) {
      messageHandler = handler
    },
    get onmessage () {
      return messageHandler
    }
  }

  function connect () {
    ws = socket()
    ws.onmessage = ({ data }) => {
      if (DEBUG) console.log('<', JSON.stringify(JSON.parse(data), null, 2))
      messageHandler(JSON.parse(data))
    }
    ws.onclose = () => setTimeout(connect, 3000)
  }
}

function removePeer ({ peerId, onConnectionStateChange }) {
  if (DEBUG) console.log('removing peer %s', peerId)
  const connection = connections[peerId]
  if (connection) {
    delete connections[peerId]
    connection.close()
    onConnectionStateChange(connection)
  }
}

function peer ({ peerId, stream, onConnectionStateChange }) {
  const connection = new window.RTCPeerConnection(configuration)
  connection.peerId = peerId
  connection.sentSignals = {}

  if (stream) connection.addStream(stream)
  if (DEBUG) console.log('creating peer %s'.peerId)

  connection.onconnectionstatechange = () => {
    onConnectionStateChange(connection)
    if (
      ['failed', 'disconnected', 'closed'].includes(connection.connectionState)
    ) {
      removePeer({ peerId, onConnectionStateChange })
    }
  }

  setTimeout(() => {
    if (connection.connectionState !== 'connected') {
      if (DEBUG) console.log('peer %s failed to connect'.peerId)
      removePeer({ peerId, onConnectionStateChange })
    }
  }, 30000)

  connection.onicecandidate = e => {
    if (!e.candidate) {
      const { type, sdp } = connection.localDescription
      if (!connection.sentSignals[type]) {
        signal.send({
          type: connection.localDescription.type,
          payload: {
            id,
            to: peerId,
            name,
            instrument,
            [type]: {
              type,
              sdp: sdp.replace(/a=ice-options:trickle\s\n/g, '')
            }
          }
        })
        connection.sentSignals[type] = true
      }
    }
  }

  return connection
}

function dial () {
  signal.send({
    type: 'dial',
    payload: {
      id,
      name: window.localStorage.getItem('player'),
      instrument: window.localStorage.getItem('instrument')
    }
  })
  DEBUG = window.localStorage.getItem('DEBUG')
  if (DEBUG) {
    window.connections = connections
  } else {
    delete window.connections
  }
  setTimeout(dial, 10000)
}
