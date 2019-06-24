import app from './components/app.js'
import './register-sw.js'
import getAudioInput from './get-audio-input.js'

if (
  window.location.hostname !== 'localhost' &&
  window.location.protocol !== 'https:'
) {
  window.location.href = window.location.href.replace(/http:/, 'https:')
}

if (window.location.pathname === '/') {
  window.location.href = `/${window.prompt('room?')}`
}

createApp()

async function createApp () {
  try {
    const el = await app(await getAudioInput())
    window.document.body.appendChild(el)
  } catch (err) {
    window.document.body.innerHTML = `<h1>Sorry failed to load ${
      err.message
    }</h1>`
  }
}
