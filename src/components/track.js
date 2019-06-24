import { div, img, span } from '../dom.js'
import audio from '../img/audio.svg'
import player from './player'

export default opt =>
  div(
    {
      className: `track key-${opt.key}`,
      onclick: e =>
        opt.key === 'me' && window.document.body.appendChild(player(opt))
    },
    [
      span({
        className: 'title',
        textContent: opt.title || 'New musician'
      }),
      img({
        className: 'type',
        src: audio
      }),
      span({
        className: 'instrument',
        textContent: opt.instrument || 'Unknown instrument'
      })
    ]
  )
