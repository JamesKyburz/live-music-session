import track from './track.js'
import { div, h4 } from '../dom.js'

export default async () => {
  return div(
    {
      className: 'tracks'
    },
    [
      h4({
        className: 'session-in-progress',
        textContent: `Live session ${process.env.VERSION}`
      }),
      div(
        {
          className: 'slider'
        },
        [
          track({
            title: 'You',
            key: 'me',
            instrument: window.localStorage.getItem('instrument'),
            type: 'audio'
          })
        ]
      )
    ]
  )
}
