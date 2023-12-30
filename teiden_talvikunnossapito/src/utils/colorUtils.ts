
export const getColorFromTime = (time: number) => {
  // const degAmount = 1 - ((1703710800000 - time) / 129600000) //Sample time to match 28.12 dataset
  // const degAmount = 1 - ((1703613600000 - time) / 129600000) //Sample time to match 26.12 dataset
  const degAmount = 1 - ((Date.now() - (time)) / 172800000) //Current time
  const hsv = { h: (155 * degAmount) / 360, s: 1, v: 1 * degAmount + 0.6 }
  return hsvToHex(hsv)
}

const valueToHex = (v: number) => {
  const hex = v.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}


const hsvToHex = (hsv: { h: number, s: number, v: number }) => {

  let r = 0, g = 0, b = 0
  if (hsv.s > 1) {
    hsv.s = 1
  }
  if (hsv.v > 1) {
    hsv.v = 1
  }
  const i = Math.floor(hsv.h * 6)
  const f = hsv.h * 6 - i
  const p = hsv.v * (1 - hsv.s)
  const q = hsv.v * (1 - f * hsv.s)
  const t = hsv.v * (1 - (1 - f) * hsv.s)

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
