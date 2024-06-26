const { User, Tweet, Reply, Like } = require('../models')
const helpers = require('../_helpers')

const tweetController = {
  getTweets: async (req, res, next) => {
    try {
      let tweets = await Tweet.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'account', 'name', 'avatar', 'introduction', 'role', 'front_cover']
          },
          {
            model: Reply,
            attributes: ['id']
          },
          { model: Like }],
        order: [['createdAt', 'DESC']]
      })
      if (!tweets) {
        return res.status(404).json({
          status: 'error',
          message: 'Tweet不存在!'
        })
      }

      const likedTweetId = helpers.getUser(req)?.LikedTweets ? helpers.getUser(req).LikedTweets.map(t => t.id) : []

      tweets = await tweets.map(tweet => tweet.toJSON())
      tweets = tweets.map(tweet => {
        return {
          ...tweet,
          id: tweet.id,
          UserId: tweet.UserId,
          description: tweet.description,
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt,
          replyCount: tweet.Replies.length,
          likeCount: tweet.Likes.length,
          isLiked: likedTweetId.some(item => item === tweet.id)
        }
      })
      return res.status(200).json(tweets)
    } catch (err) {
      next(err)
    }
  },
  postTweet: async (req, res, next) => {
    try {
      const UserId = helpers.getUser(req).id
      const { description } = req.body

      if (!UserId) {
        return res.status(404).json({
          status: 'error',
          message: '偵測不到當前使用者!'
        })
      }
      if (!description || !description.trim()) {
        return res.status(400).json({
          status: 'error',
          message: '推文內容不可以空白!'
        })
      }
      if (description.length > 140) {
        return res.status(400).json({
          status: 'error',
          message: '字數不可以超過140字!'
        })
      }
      const tweet = await Tweet.create({
        description,
        UserId
      })

      return res.status(200).json({
        status: 'success',
        message: '成功建立一則推文!',
        tweet
      })
    } catch (err) {
      next(err)
    }
  },
  getTweet: async (req, res, next) => {
    try {
      let tweet = await Tweet.findByPk(req.params.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'account', 'name', 'avatar', 'introduction', 'role', 'front_cover']
          },
          {
            model: Reply,
            attributes: ['id']
          },
          {
            model: Like
          }
        ],
        order: [['createdAt', 'DESC']]
      })
      if (!tweet) {
        return res.status(404).json({
          status: 'error',
          message: '找不到此推特!'
        })
      }

      const likedTweetId = helpers.getUser(req)?.LikedTweets ? helpers.getUser(req).LikedTweets.map(t => t.id) : []
      tweet = await tweet.toJSON()
      const data = {
        ...tweet,
        replyCount: tweet.Replies.length,
        likeCount: tweet.Likes.length,
        isLiked: likedTweetId.some(item => item === tweet.id)
      }
      return res.status(200).json(data)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = tweetController
