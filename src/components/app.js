import Controls from '../controls.js'
import recorder from './recorder.js'
import tracks from './tracks.js'
import chat from './chat.js'
import { div } from '../dom.js'

const controls = Controls()

export default async input =>
  div([chat(controls.chat()), await tracks(), recorder(controls.record(input))])
