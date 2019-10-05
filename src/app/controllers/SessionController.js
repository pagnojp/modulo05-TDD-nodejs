const { User } = require('../models')
const Mail = require('../services/MailService')

class SessionController {
  async store(req, res){
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'user not found' })
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'incorrect password' })
    }

    await Mail.send({
      from: 'João <pagnojp@gmail.com>',
      to: `${user.name} <${user.email}>`,
      subject: 'Novo login na conta',
      text: 'Novo acesso registrado em sua conta'
    })

    return res.json({
      token: await user.generateToken()
    })
  }
}

module.exports = new SessionController()