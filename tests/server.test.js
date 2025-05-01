const path = require('path');
const fs = require('fs');
const request = require('supertest');
const { beforeAll, afterAll, it, expect } = require('@jest/globals');

// Primero definimos el directorio temporal
const contentDir = path.join(__dirname, 'content-test');

// Seteamos la variable de entorno antes de requerir el servidor
process.env.CONTENT_DIR = contentDir;

const app = require('../index'); // Este ya va a usar el directorio correcto

beforeAll(() => {
  fs.mkdirSync(path.join(contentDir, 'test-page'), { recursive: true });
  fs.writeFileSync(
    path.join(contentDir, 'test-page', 'index.md'),
    '# Hello World\n\nThis is a test page.'
  );
});

it('should return 200 for a valid URL', async () => {
  const res = await request(app).get('/api/pages/test-page');
  console.log('Status:', res.status);
  console.log('Body:', res.body);
  expect(res.status).toBe(200);
});

it('should return HTML containing content from the index.md file', async () => {
  const res = await request(app).get('/api/pages/test-page');
  expect(res.text).toContain('<h1>Hello World</h1>');
  expect(res.text).toContain('<p>This is a test page.</p>');
});

it('should return 404 for a non-existing URL', async () => {
  const res = await request(app).get('/api/pages/non-existent-page');
  expect(res.status).toBe(404);
});

afterAll(() => {
  fs.rmSync(contentDir, { recursive: true, force: true });
});
