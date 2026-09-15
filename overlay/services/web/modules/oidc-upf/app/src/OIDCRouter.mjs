import AuthenticationController from '../../../../app/src/Features/Authentication/AuthenticationController.mjs'
import OIDCAuthenticationController from './OIDCAuthenticationController.mjs'

export default {
  apply(webRouter) {
    webRouter.get('/oidc/login', OIDCAuthenticationController.passportLogin)
    AuthenticationController.addEndpointToLoginWhitelist('/oidc/login')

    webRouter.get(
      '/oidc/login/callback',
      OIDCAuthenticationController.passportLoginCallback
    )
    AuthenticationController.addEndpointToLoginWhitelist('/oidc/login/callback')
  },
}
