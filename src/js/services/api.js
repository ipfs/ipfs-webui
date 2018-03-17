import API from 'ipfs-api'
import {sortBy} from 'lodash-es'
import {join} from 'path'

const host = window.location.hostname
const port = window.location.port

const localApi = new API(host, port, {
  protocol: window.location.protocol
})

// -- Public Interface

export const id = localApi.id

export const files = {
  list (root, api = localApi) {
    return api.files.ls(root)
      .then((res) => {
        const files = sortBy(res, 'name') || []

        return Promise.all(files.map((file) => {
          return api.files.stat(join(root, file.name))
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

  mv (from, to, api = localApi) {
    return api.files.mv([from, to])
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
    return api.files.read(name)
  }
}

export const getConfig = (api = localApi) => {
  return api.config.get()
    .then((res) => JSON.parse(res.toString()))
}

export const saveConfig = (config, api = localApi) => {
  return api.config.replace(config)
}
