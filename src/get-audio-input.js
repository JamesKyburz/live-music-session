import selectAudioInput from './select-audio-input.js'

export default async () => {
  const audioDeviceId = window.sessionStorage.getItem('audio-deviceid')

  const supportedConstraints = window.navigator.mediaDevices.getSupportedConstraints()

  const audio = await window.navigator.mediaDevices
    .getUserMedia({
      audio: {
        sampleRate: 44100,
        channelCount: 2,
        volume: 1,
        ...(supportedConstraints.echoCancellation && {
          echoCancellation: false
        }),
        ...(supportedConstraints.noiseSuppression && {
          noiseSuppression: false
        }),
        ...(supportedConstraints.autoGainControl && { autoGainControl: false }),
        ...(audioDeviceId && { deviceId: { exact: audioDeviceId } })
      }
    })
    .catch(_ => null)

  if (!audio || !audioDeviceId) await selectAudioInput()

  return audio
}
