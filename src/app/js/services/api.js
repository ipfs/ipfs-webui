import API from 'ipfs-api'
import {sortBy} from 'lodash-es'
import {join} from 'path'
import bl from 'bl'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const localApi = new API(host, port)

function collect (stream) {
  return new Promise((resolve, reject) => {
    stream.pipe(bl((err, buf) => {
      if (err) return reject(err)
      resolve(buf)
    }))
  })
}

// -- Public Interface

export const id = localApi.id

export const files = {
  list (root, api = localApi) {
    return api.files.ls(root)
      .then((res) => {
        const files = sortBy(res.Entries, 'Name') || []

        return Promise.all(files.map((file) => {
          return api.files.stat(join(root, file.Name))
            .then((stats) => {
              return {...file, ...stats}
            })
        }))
      })
  },
  mkdir (name, api = localApi) {
    return api.files.mkdir(name)
  },
  rmdir (name, api = localApi) {
    return api.files.rm(name, {recursive: true})
  },

  createFiles (root, files, api = localApi) {
    // root is the directory we want to store the files in
    return Promise.all(files.map((file) => {
      const target = join(root, file.name)
      return api.files.write(target, file.content, {create: true})
    }))
  },

  stat (name, api = localApi) {
    return api.files.stat(name)
  },

  read (name, api = localApi) {
    return api.files.read(name).then(collect)
  }
}

export const getConfig = (api = localApi) => {
  return api.config.get()
    .then((res) => JSON.parse(res.toString()))
}

export const saveConfig = (config, api = localApi) => {
  return api.config.replace(config)
}
