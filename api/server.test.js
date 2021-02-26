const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')

const spiderman = {username: 'Spiderman', password:'NYC123'}
const thor = {user: 'Thor', password:'ASGARD123'}

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
      res = await (await request(server).post('/api/auth/register')).send(thor)
      expect(res.body).toMatchObject({id:1, ...thor})

      res = await (await request(server).post('/api/auth/register')).send(spiderman)
      expect(res.body).toMatchObject({id:2, ...spiderman})
    })
  })
})