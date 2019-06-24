import { p, img, div, input } from '../dom.js'
import audio from '../img/audio.svg'
import back from '../img/back.svg'

export default () => {
  return div(
    {
      className: 'player'
    },
    [
      div({ className: 'info' }, [
        input({
          className: 'name',
          placeholder: 'Your name?',
          oninput: e => {
            window.localStorage.setItem('player', e.target.value)
          },
          value: window.localStorage.getItem('player') || ''
        }),
        input({
          className: 'instrument',
          placeholder: 'Your instrument?',
          oninput: e => {
            window.localStorage.setItem('instrument', e.target.value)
            const myInstrument = window.document.querySelector(
              '.track.key-me .instrument'
            )
            if (myInstrument) myInstrument.textContent = e.target.value
          },
          value: window.localStorage.getItem('instrument') || ''
        }),
        ...[
          'Please check your microphone first.',
          'Wear headphones before you start to record.',
          'If you experience sound problems during the session, please stop recording until fixed.'
        ].map(textContent =>
          p({
            className: 'instructions',
            textContent
          })
        ),
        img({
          className: 'back',
          src: back,
          onclick (e) {
            const player = window.document.querySelector('.player')
            if (player) player.parentNode.removeChild(player)
          }
        }),
        img({ className: 'type', src: audio })
      ])
    ]
  )
}
