const request = require('supertest');
const pino = require('pino');
const { createApp } = require('../src/app');
const { createMemoryRepository } = require('../src/tasks/memoryRepository');

test('GET /metrics expose le compteur de requetes par route', async () => {
  const app = createApp({ repo: createMemoryRepository(), logger: pino({ level: 'silent' }) });
  await request(app).get('/health');
  const res = await request(app).get('/metrics');
  expect(res.status).toBe(200);
  expect(res.text).toContain('http_requests_total{method="GET",route="/health",status_code="200"}');
});
