'use strict'
const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = []
    const admin = {
      account: 'root',
      name: 'root',
      email: 'root@example.com',
      password: await bcrypt.hash('12345678', 10),
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: `https://randomuser.me/api/portraits/women/${10}.jpg`,
      front_cover: `https://picsum.photos/400/300?random=${10}`
    }
    users.push(admin)

    for (let i = 1; i < 6; i++) {
      const user = {
        account: `user${i}`,
        name: `user${i}`,
        email: `user${i}@example.com`,
        password: await bcrypt.hash('12345678', 10),
        introduction: faker.lorem.text().substring(0, 150),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: `https://randomuser.me/api/portraits/women/${i}.jpg`,
        front_cover: `https://picsum.photos/400/300?random=${i}`
      }
      users.push(user)
    }

    await queryInterface.bulkInsert('Users', users, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
}
