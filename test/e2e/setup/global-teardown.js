import path from 'path'
import fs from 'fs'
export default async (config) => {
  fs.rmSync(path.join(__dirname, 'ipfs-backend.json'), { force: true })
}
