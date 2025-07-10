const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:80'; // Default for local run, overridden by docker-compose for CI

describe('Integration Tests for Deployed Application', () => {
  it('should respond to GET / from Nginx', async () => {
    try {
      const response = await axios.get(API_URL);
      expect(response.status).toBe(200);
      expect(response.data).toBe('Hello from the Mega-Lab Node.js App!');
    } catch (error) {
      console.error('Integration Test Error (GET /):', error.message);
      throw error; // Re-throw to fail the test
    }
  }, 40000); // Increased timeout for potentially slow startup

  it('should respond to GET /api/status from Nginx and Node.js app', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/status`);
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ status: 'running', message: 'API is healthy' });
    } catch (error) {
      console.error('Integration Test Error (GET /api/status):', error.message);
      throw error;
    }
  }, 40000); // Increased timeout
});