import passport from 'passport'
import logger from '@overleaf/logger'
import AuthenticationController from '../../../../app/src/Features/Authentication/AuthenticationController.mjs'
import OIDCAuthenticationManager from './OIDCAuthenticationManager.mjs'

const OIDCAuthenticationController = {
  passportLogin(req, res, next) {
    passport.authenticate('openidconnect')(req, res, next)
  },

  passportLoginCallback(req, res, next) {
    passport.authenticate('openidconnect', async (err, user, info) => {
      if (err) {
        logger.err({ err }, 'OIDC: erro na autenticacao')
        return next(err)
      }
      if (!user) {
        return res.redirect('/login')
      }
      try {
        await AuthenticationController.promises.finishLogin(user, req, res)
      } catch (error) {
        return next(error)
      }
    })(req, res, next)
  },

  async doPassportLogin(
    req,
    issuer,
    profile,
    context,
    idToken,
    accessToken,
    refreshToken,
    done
  ) {
    try {
      const auditLog = { ipAddress: req.ip }
      const user = await OIDCAuthenticationManager.promises.findOrCreateUser(
        profile,
        auditLog
      )
      return done(null, user || false)
    } catch (error) {
      return done(error)
    }
  },
}

export default OIDCAuthenticationController
