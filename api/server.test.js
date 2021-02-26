const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')

const spiderman = {username: 'Spiderman', password:'NYC123'}
const thor = {username: 'Thor', password:'ASGARD123'}

beforeAll(async ()=>{
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async ()=>{
  await db('users').truncate()
})

afterAll(async ()=>{
  await db.destroy()
})

test('sanity', () => {
  expect(true).toBe(true)
})


describe('server', () =>{
  describe('[POST] /api/auth/register', () =>{
    it('responds with 201 status', async () =>{
      const res = await request(server).send(spiderman)
      expect(res.status).toBe(201)
    })
    it('responds with new user', async () =>{
      let res
      res = await request(server).post('/api/auth/register').send(thor)
      expect(res.body.username).toBe('Thor')

      res = await request(server).post('/api/auth/register').send(spiderman)
      expect(res.body.username).toBe('Spiderman')
    })
  })
  describe('[POST] /api/auth/login', () =>{
    it('responds with 200 status', async() =>{
      await request(server).post('/api/auth/register').send(thor)
      const res = await request(server).post('/api/auth/login').send(thor)
      expect(res.status).toBe(200)
    })
    it('responds with message welcoming user', async () =>{
      let res 
      await request(server).post('/api/auth/register').send(spiderman)
      res = await request(server).post('/api/auth/login').send(spiderman)
     expect(res.body.message).toBe('Welcome, Spiderman')
    })
  })
  describe('[GET] /api/jokes', () =>{
    it('responds with 200 status', async() =>{
      let res
      await request(server).post('/api/auth/register').send(thor)
      res = await request(server).post('/api/auth/login').send(thor)
      const token = res.body.token
      res = await request(server).get('/api/jokes').set('Authorization', token)
      expect(res.status).toBe(200)
    })
    it('responds with correct number of jokes', async() =>{
      let res 
      await request(server).post("/api/auth/register").send(thor)
      res = await request(server).post("/api/auth/login").send(thor)
      const token = res.body.token
      res = await request(server).get('/api/jokes').set('Authorization', token)
      expect(res.body).toHaveLength(3)
    })
  })
})