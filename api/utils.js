const roles = ['user', 'coordinator', 'admin'];

module.exports.hasRole = function(role) {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === role) {
      next();
    } else {
      res.send(403, 'Insufficient permissions');
    }
  };
}

