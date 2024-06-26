const express = require('express')
const router = express.Router()

const { errorHandler } = require('../middleware/error-handler')

const passport = require('../config/passport')

// Controller
const userController = require('../controllers/user-controller')
const adminController = require('../controllers/admin-controller')

// Middleware
const { authenticated, authenticatedAdmin } = require('../middleware/auth')

// module
const users = require('./modules/users')
const admin = require('./modules/admin')
const tweets = require('./modules/tweets')
const followships = require('./modules/followships')

router.post('/admin/signin', passport.authenticate('local', { session: false }), adminController.signIn)
router.post('/users', userController.signUp)
router.post('/users/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.use('/users', authenticated, users)
router.use('/admin', authenticated, authenticatedAdmin, admin)
router.use('/tweets', authenticated, tweets)
router.use('/followships', authenticated, followships)

router.use('/', errorHandler)

module.exports = router
