const app = require('../../app');
const supertest = require('supertest');

describe('Unit Tests for app.js', () => {
  it('should return "Hello from the DevOps-Lab Node.js App!" for GET /', async () => {
    const response = await supertest(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello from the DevOps-Lab Node.js App!');
  });

  it('should return JSON status for GET /api/status', async () => {
    const response = await supertest(app).get('/api/status');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'running', message: 'API is healthy' });
  });
});