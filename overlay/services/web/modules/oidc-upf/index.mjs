import OIDCRouter from './app/src/OIDCRouter.mjs'
import OIDCModuleManager from './app/src/OIDCModuleManager.mjs'

export default {
  router: OIDCRouter,
  name: 'oidc-upf',

  // Executado quando o Overleaf inicializa o modulo.
  init() {
    OIDCModuleManager.initSettings()
  },
}
