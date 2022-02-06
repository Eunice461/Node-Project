const request = require('supertest')
const app = require('../../app');

describe('Test GET /launches', () => {
    test('It should respone with 200 success', async () => {
        const response = await request(app)
        .get('/launches')
        .expect('Content-Type', /json/)
        .expect(200)
    })
}) 

describe('Test POST /launches', () => {
    test('It should respone with 200 succes', () => {

    })
    test('It should catch missing required properties', () => {});
    test('It should catch invaild date', () => {})
})