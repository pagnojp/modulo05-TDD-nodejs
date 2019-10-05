const request = require('supertest')
const app = require('../../src/app')
const truncate = require('../utils/truncate')
const factory = require('../factories')
const nodemailer = require('nodemailer')

jest.mock('nodemailer')

const transporter = {
  sendMail: jest.fn()
}

describe('Authentication', () => {
  beforeEach( async () => {
    await truncate()
  })

  beforeAll(() => {
    nodemailer.createTransport.mockReturnValue(transporter)
  })

  it('should be able to authenticate with valid credentials', async () => {
    const user = await factory.create('User', {
      password: "123456"
    })
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: "123456"
      })
    expect(response.status).toBe(200)  
  })

  it('should not be able to authenticate with invalid credentials', async () => {
    const user = await factory.create('User', {
      password: "123123"
    })
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: "123456"
      })
    expect(response.status).toBe(401)  
  })

  it('should return JWT token when authenticate', async () => {
    const user = await factory.create('User', {
      password: "123123"
    })
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: "123123"
      })
    expect(response.body).toHaveProperty('token')
  })

  it('should be able to access private routes when authenticated', async () => {
    const user = await factory.create('User')
    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${user.generateToken()}`)
    expect(response.status).toBe(200)
  })

  it('should NOT be able to access private routes when not authenticated', async () => {
    const response = await request(app)
      .get('/dashboard')
    expect(response.status).toBe(401)
  })

  it('should NOT be able to access private routes when not authenticated', async () => {
    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer 132132`)
    expect(response.status).toBe(401)
  })

  it('should receive email notification when authenticated', async () => {
    const user = await factory.create('User', {
      password: "123456"
    })
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: "123456"
      })
    expect(transporter.sendMail).toHaveBeenCalledTimes(1)
  })

})