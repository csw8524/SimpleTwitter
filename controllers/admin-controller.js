const jwt = require('jsonwebtoken')
const { Sequelize } = require('sequelize')

const { User, Tweet, Like, Reply } = require('../models')

const adminController = {
  signIn: (req, res, next) => {
    try {
      if (req.user.error) {
        return res.status(400).json(req.user.error)
      }

      if (req.user.role !== 'admin') {
        return res.status(400).json({
          status: 'error',
          message: '帳號或密碼錯誤!'
        })
      }

      const userData = req.user.toJSON()
      delete userData.password
      delete userData.introduction
      delete userData.createdAt
      delete userData.updatedAt
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      res.status(200).json({
        status: 'success',
        token,
        user: userData
      })
    } catch (err) {
      next(err)
    }
  },
  getUsers: async (req, res, next) => {
    try {
      let users = await User.findAll({
        include: [
          {
            model: Tweet,
            include: Like
          }
        ],
        attributes: [
          'id',
          'name',
          'avatar',
          'account',
          'front_cover',
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM Tweets WHERE Tweets.UserId = User.id)'
            ),
            'tweetsCount'
          ],
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE Followships.followerId = User.id)'
            ),
            'followingsCount'
          ],
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
            ),
            'followersCount'
          ]
        ],
        order: [[Sequelize.literal('tweetsCount'), 'DESC'], ['name', 'ASC']]
      })

      users = await users.map(user => {
        let likedTweetsCount = 0
        user.Tweets.forEach(tweet => {
          likedTweetsCount += tweet.Likes.length
        })
        return {
          id: user.dataValues.id,
          name: user.dataValues.name,
          avatar: user.dataValues.avatar,
          account: user.dataValues.account,
          tweetsCount: user.dataValues.tweetsCount,
          front_cover: user.dataValues.front_cover,
          likedTweetsCount,
          followingsCount: user.dataValues.followingsCount,
          followersCount: user.dataValues.followersCount
        }
      })

      res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  },
  deleteTweet: async (req, res, next) => {
    try {
      const tweetId = Number(req.params.id)
      const tweet = await Tweet.findByPk(tweetId)

      if (!tweet) res.status(404).json({ status: 'error', message: '找不到此推文!' })

      await tweet.destroy()
      await Reply.destroy({ where: { TweetId: tweetId } })
      await Like.destroy({ where: { TweetId: tweetId } })

      return res.status(200).json({
        status: 'success',
        message: '刪除推文成功!',
        tweet
      })
    } catch (error) {
      next(error)
    }
  },
  getTweets: async (req, res, next) => {
    try {
      const tweets = await Tweet.findAll({
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          attributes: [
            'id',
            'name',
            'avatar'
          ]
        }]
      })

      return res.status(200).json(tweets)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController
