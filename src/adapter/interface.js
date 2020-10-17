
/**
 * defines adapter interface
 */
class IAdapter {
  async searchUsername (username) {
    throw new Error()
  }

  async searchMail (mail) {
    throw new Error()
  }

  async syncAllUsers (res) {
    throw new Error()
  }

  async verifyPassword (username, password) {
    throw new Error()
  }

  async updatePassword (username, newPassword) {
    throw new Error()
  }
}

module.exports = {
  IAdapter
}
