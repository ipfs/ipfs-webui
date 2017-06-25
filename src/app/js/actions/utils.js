const REQUEST = 'REQUEST'
const SUCCESS = 'SUCCESS'
const FAILURE = 'FAILURE'

export function createRequestTypes (base) {
  const res = {}
  const types = [REQUEST, SUCCESS, FAILURE]
  types.forEach((type) => {
    res[type] = `${base}_${type}`
  })

  return res
}

export function action (type, payload = {}) {
  return {type, ...payload}
}

function createPageConstants (name) {
  return {
    LOAD: `LOAD_${name.toUpperCase()}_PAGE`,
    LEAVE: `LEAVE_${name.toUpperCase()}_PAGE`
  }
}

function createPageActions (name, consts) {
  return {
    load: () => action(consts.LOAD),
    leave: () => action(consts.LEAVE)
  }
}

export function createPage (name) {
  const consts = createPageConstants(name)
  return {
    [name.toUpperCase()]: consts,
    [name]: createPageActions(name, consts)
  }
}
