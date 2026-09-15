import crypto from 'node:crypto'
import Settings from '@overleaf/settings'
import UserCreator from '../../../../app/src/Features/User/UserCreator.mjs'
import ThirdPartyIdentityManager from '../../../../app/src/Features/User/ThirdPartyIdentityManager.mjs'
import { ParallelLoginError } from '../../../../app/src/Features/Authentication/AuthenticationErrors.mjs'
import { User } from '../../../../app/src/models/User.mjs'

const OIDCAuthenticationManager = {
  async findOrCreateUser(profile, auditLog) {
    const providerId = Settings.oidcUpf.providerId
    const allowedDomain = Settings.oidcUpf.allowedDomain

    const email = profile.emails[0].value
    const externalUserId = profile.id
    const firstName = profile.name?.givenName || ''
    const lastName = profile.name?.familyName || ''
    const externalData = null

    const domain = email.split('@')[1]
    if (allowedDomain && domain !== allowedDomain) {
      return null
    }

    let user
    try {
      user = await ThirdPartyIdentityManager.promises.login(
        providerId,
        externalUserId,
        externalData
      )
    } catch {
      user = await User.findOne({ email }).exec()
      if (!user) {
        user = await UserCreator.promises.createNewUser({
          email,
          first_name: firstName,
          last_name: lastName,
          holdingAccount: false,
          analyticsId: crypto.randomUUID(),
        })
      }
      auditLog.initiatorId = user._id
      await ThirdPartyIdentityManager.promises.link(
        user._id,
        providerId,
        externalUserId,
        externalData,
        auditLog
      )
      await User.updateOne(
        { _id: user._id },
        { $set: { 'emails.0.confirmedAt': Date.now() } }
      ).exec()
    }

    const result = await User.updateOne(
      { _id: user._id, loginEpoch: user.loginEpoch },
      { $inc: { loginEpoch: 1 } }
    ).exec()
    if (result.modifiedCount !== 1) {
      throw new ParallelLoginError()
    }

    return user
  },
}

export default {
  promises: OIDCAuthenticationManager,
}
