const request = require('supertest');
const pino = require('pino');
const { createApp } = require('../src/app');
const { createMemoryRepository } = require('../src/tasks/memoryRepository');

function buildApp() {
  return createApp({ repo: createMemoryRepository(), logger: pino({ level: 'silent' }) });
}

test('GET /health repond ok', async () => {
  const res = await request(buildApp()).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

test('POST /tasks cree une tache', async () => {
  const res = await request(buildApp()).post('/tasks').send({ title: 'Premiere tache' });
  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ title: 'Premiere tache', done: false });
});

test('POST /tasks avec un titre vide renvoie 400', async () => {
  const res = await request(buildApp()).post('/tasks').send({ title: '' });
  expect(res.status).toBe(400);
});

test('PATCH /tasks/abc renvoie 400', async () => {
  const res = await request(buildApp()).patch('/tasks/abc').send({ done: true });
  expect(res.status).toBe(400);
});

test('DELETE /tasks/99 renvoie 404', async () => {
  const res = await request(buildApp()).delete('/tasks/99');
  expect(res.status).toBe(404);
});

