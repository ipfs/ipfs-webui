export const getBoxShadow = (multiplier, isActive, palette) => {
  const colors = [...palette]
  if (isActive) colors.reverse()

  return `
  inset ${multiplier * -1}px ${multiplier * -1}px 0 ${colors[0]},
  inset ${multiplier}px ${multiplier}px 0 ${colors[1]},
  inset ${multiplier * -2}px ${multiplier * -2}px 0 ${colors[0]},
  inset ${multiplier * 2}px ${multiplier * 2}px 0 ${colors[1]},
  inset ${multiplier * -3}px ${multiplier * -3}px 0 ${colors[0]},
  inset ${multiplier * 3}px ${multiplier * 3}px 0 ${colors[1]},
  0 ${multiplier * -2}px 0 ${multiplier * -1}px #1E1E1E,
  0 ${multiplier * 2}px 0 ${multiplier * -1}px #1E1E1E,
  ${multiplier * -2}px 0 0 ${multiplier * -1}px #1E1E1E,
  ${multiplier * 2}px 0 0 ${multiplier * -1}px #1E1E1E
  `
}

export const getBoxShadowWithoutBorders = (multiplier, isActive, palette) => {
  const colors = [...palette]
  if (isActive) colors.reverse()

  return `
  inset ${multiplier * -1}px ${multiplier * -1}px 0 ${colors[0]},
  inset ${multiplier}px ${multiplier}px 0 ${colors[1]},
  inset ${multiplier * -2}px ${multiplier * -2}px 0 ${colors[0]},
  inset ${multiplier * 2}px ${multiplier * 2}px 0 ${colors[1]},
  inset ${multiplier * -3}px ${multiplier * -3}px 0 ${colors[0]},
  inset ${multiplier * 3}px ${multiplier * 3}px 0 ${colors[1]}
  `
}
