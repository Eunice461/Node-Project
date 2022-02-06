const { response } = require('express');
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
    const completeLaunchData = {
        mission: 'USS Enterprise',
        rocket: 'NCC I701-D',
        target: 'Kepler-186 f',
        launchDate: 'January 4, 2028',
    }

    const launchDateWithoutDate = {
        mission: 'USS Enterprise',
        rocket: 'NCC I701-D',
        target: 'Kepler-186 f',
    }
    const launchDataWithInvlidDate = {
        mission: 'USS Enterprise',
        rocket: 'NCC I701-D',
        target: 'Kepler-186 f',
        launchDate: 'zoot',
    }

    test('It should respone with 201 created', async () => {
        const response = await request(app)
        .post('/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201)

        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date (response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate)

        expect(response.body).toMatchObject(launchDateWithoutDate)
    })
    test('It should catch missing required properties', async () => {
        const response = await request(app)
        .post('/launches')
        .send(launchDateWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400)

        expect(response.body).toStrictEqual({
            error: 'Missing required launch property'
        })
    });
    test('It should catch invaild date', async () => {
        const response = await request(app)
        .post('/launches')
        .send(launchDataWithInvlidDate)
        .expect('Content-Type', /json/)
        .expect(400)

        expect(response.body).toStrictEqual({
            error: "Invalid launch date"
        })
    })
})