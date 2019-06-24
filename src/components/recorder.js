import { img, div } from '../dom.js'
import recordAudio from '../img/record-audio.svg'
import stopRecording from '../img/stop-recording.svg'

export default opt =>
  div(
    {
      className: 'recorder'
    },
    [
      div(
        {
          className: 'controls'
        },
        [
          img({
            className: 'audio',
            ...(!opt.canRecord() && { style: 'display: none;' }),
            src: recordAudio,
            onclick: opt.onRecord()
          }),
          img({ className: 'stop', src: stopRecording, onclick: opt.onStop })
        ]
      )
    ]
  )
