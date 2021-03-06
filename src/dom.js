const createElement = name => (opt, children) => {
  if (Array.isArray(opt)) [children, opt] = [opt, {}]
  const el = window.document.createElement(name)
  for (const child of children || []) el.appendChild(child)
  for (const [key, value] of Object.entries(opt)) if (value) el[key] = value
  return el
}
export const div = createElement('div')
export const img = createElement('img')
export const input = createElement('input')
export const form = createElement('form')
export const h4 = createElement('h4')
export const span = createElement('span')
export const audio = createElement('audio')
export const datalist = createElement('datalist')
export const option = createElement('option')
export const p = createElement('p')
