import Settings from '@overleaf/settings'
import { Strategy as OIDCStrategy } from 'passport-openidconnect'
import OIDCAuthenticationController from './OIDCAuthenticationController.mjs'

const GOOGLE_ISSUER = 'https://accounts.google.com'
const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

const PROVIDER_ID = 'oidc-upf'

const OIDCModuleManager = {
  initSettings() {
    Settings.oidcUpf = {
      enable: true,
      providerId: PROVIDER_ID,
      clientID: process.env.OVERLEAF_OIDC_CLIENT_ID,
      clientSecret: process.env.OVERLEAF_OIDC_CLIENT_SECRET,
      allowedDomain: process.env.OVERLEAF_OIDC_ALLOWED_DOMAIN || 'upf.br',
    }

    if (!Settings.oauthProviders) {
      Settings.oauthProviders = {}
    }
    Settings.oauthProviders[PROVIDER_ID] = {
      name: 'UPF (Google)',
availableIf: () => true,
    }
  },

  passportSetup(passport, callback) {
    const options = {
      issuer: GOOGLE_ISSUER,
      authorizationURL: GOOGLE_AUTHORIZATION_URL,
      tokenURL: GOOGLE_TOKEN_URL,
      userInfoURL: GOOGLE_USER_INFO_URL,
      clientID: Settings.oidcUpf.clientID,
      clientSecret: Settings.oidcUpf.clientSecret,
      callbackURL: `${Settings.siteUrl.replace(/\/+$/, '')}/oidc/login/callback`,
      scope: 'openid profile email',
      passReqToCallback: true,
    }
    try {
      passport.use(
        new OIDCStrategy(options, OIDCAuthenticationController.doPassportLogin)
      )
      callback(null)
    } catch (error) {
      callback(error)
    }
  },
}

export default OIDCModuleManager
