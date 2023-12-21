export const randomizeColor = () => {
  const rgb = {
    r: Math.floor(Math.random() * 245 + 10),
    g: Math.floor(Math.random() * 245 + 10),
    b: Math.floor(Math.random() * 245 + 10)
  }
  const valueToHex = (v: number) => {
    const hex = v.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${valueToHex(Math.round(rgb.r))}${valueToHex(Math.round(rgb.g))}${valueToHex(Math.round(rgb.b))}`
}
