module.exports = {
    ensureAuth: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next()
      }
      res.redirect('/ap/auth/login') // if not auth
    },
  
    forwardAuth: (req, res, next) => {
      if (!req.isAuthenticated()) {
        return next()
      }
      res.redirect('/ap/dashboard');  // if auth    
    }
  }