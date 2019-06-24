import { form, div, input, h4, img } from '../dom.js'
import back from '../img/back.svg'

export default ({ sendChatMessage }) => {
  return div([
    h4({
      className: 'open-chat',
      textContent: 'Chat',
      onclick () {
        const chat = window.document.querySelector('.chat')
        chat.classList.remove('hidden')
        const openChat = window.document.querySelector('.open-chat')
        openChat.classList.add('hidden')
      }
    }),
    div(
      {
        className: 'chat hidden'
      },
      [
        form(
          {
            onsubmit (e) {
              e.preventDefault()
              const messageEl = e.target.elements[0]
              sendChatMessage(messageEl.value)
              messageEl.value = ''
            }
          },
          [
            input({
              name: 'message',
              className: 'message',
              placeholder: 'Message to send?',
              autocomplete: 'off'
            })
          ]
        ),
        h4({
          className: 'connected-count',
          textContent: 'Connected to 0 musician(s)'
        }),
        div({
          className: 'messages'
        }),
        img({
          className: 'back',
          src: back,
          onclick () {
            const chat = window.document.querySelector('.chat')
            chat.classList.add('hidden')
            const openChat = window.document.querySelector('.open-chat')
            openChat.classList.remove('hidden')
          }
        })
      ]
    )
  ])
}
