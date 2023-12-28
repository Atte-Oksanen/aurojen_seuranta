export const randomizeColor = () => {
  const rgb = {
    r: Math.floor(Math.random() * 245 + 10),
    g: Math.floor(Math.random() * 245 + 10),
    b: Math.floor(Math.random() * 245 + 10)
  }
  return `#${valueToHex(Math.round(rgb.r))}${valueToHex(Math.round(rgb.g))}${valueToHex(Math.round(rgb.b))}`
}

export const getColorFromTime = (time: number) => {
  const degAmount = 1 - ((Date.now() - (time)) / 129600000)
  const hsv = { h: (115 * degAmount) / 360, s: 1, v: 1 }
  return hsvToHex(hsv)
}

const valueToHex = (v: number) => {
  const hex = v.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}
const hsvToHex = hsv => {

  let r, g, b

  let i = Math.floor(hsv.h * 6)
  let f = hsv.h * 6 - i
  let p = hsv.v * (1 - hsv.s)
  let q = hsv.v * (1 - f * hsv.s)
  let t = hsv.v * (1 - (1 - f) * hsv.s)

  switch (i % 6) {
    case 0:
      (r = hsv.v), (g = t), (b = p)
      break
    case 1:
      (r = q), (g = hsv.v), (b = p)
      break
    case 2:
      (r = p), (g = hsv.v), (b = t)
      break
    case 3:
      (r = p), (g = q), (b = hsv.v)
      break
    case 4:
      (r = t), (g = p), (b = hsv.v)
      break
    case 5:
      (r = hsv.v), (g = p), (b = q)
      break
  }
  return `#${valueToHex(Math.round(r * 255))}${valueToHex(Math.round(g * 255))}${valueToHex(Math.round(b * 255))}`
}
