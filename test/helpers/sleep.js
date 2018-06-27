export default function sleep (ms = 10) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}
