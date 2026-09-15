import OIDCRouter from './app/src/OIDCRouter.mjs'
import OIDCModuleManager from './app/src/OIDCModuleManager.mjs'

let oidcUpfModule = {}

if (process.env.OVERLEAF_OIDC_CLIENT_ID) {
  OIDCModuleManager.initSettings()
  oidcUpfModule = {
    name: 'oidc-upf',
    hooks: {
      passportSetup: OIDCModuleManager.passportSetup,
    },
    router: OIDCRouter,
  }
}

export default oidcUpfModule
