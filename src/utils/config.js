export const getConfig = (api) => {
  return () => {
    return api.config.get()
      .then((res) => JSON.parse(res.toString()))
  }
}

export const saveConfig = (api) => {
  return (config) => api.config.replace(config)
}
