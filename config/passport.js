const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const bcrypt = require('bcryptjs')

const { User, Tweet } = require('../models')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'account',
      passwordField: 'password',
      passReqToCallback: true
    },

    async (req, account, password, cb) => {
      try {
        const user = await User.findOne({ where: { account } })
        if (!user) return cb(null, { error: { status: 'error', message: '帳號或密碼錯誤' } })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return cb(null, { error: { status: 'error', message: '帳號或密碼錯誤' } })

        return cb(null, user)
      } catch (error) {
        cb(error, false)
      }
    }
  )
)

// JWT
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
passport.use(
  new JWTStrategy(jwtOptions, async (jwtPayload, cb) => {
    try {
      const user = await User.findByPk(jwtPayload.id, {
        include: [
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' },
          { model: Tweet, as: 'LikedTweets' }
        ]
      })
      if (!user) return cb(null, false)
      return cb(null, user)
    } catch (error) {
      cb(error, false)
    }
  })
)

module.exports = passport
