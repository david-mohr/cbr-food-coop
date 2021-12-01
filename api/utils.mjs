export const roles = ['user', 'coordinator', 'admin']

export function hasRole (role) {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === role) {
      next()
    } else {
      res.send(403, 'Insufficient permissions')
    }
  }
}

export const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
