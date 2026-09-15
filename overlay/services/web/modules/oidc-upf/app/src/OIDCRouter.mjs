import OIDCAuthenticationController from './OIDCAuthenticationController.mjs'

export default {
  apply(webRouter) {
    webRouter.get('/oidc/login', OIDCAuthenticationController.passportLogin)

    webRouter.get(
      '/oidc/login/callback',
      OIDCAuthenticationController.passportLoginCallback
    )
  },
}
