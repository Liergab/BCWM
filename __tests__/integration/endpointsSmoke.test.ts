/**
 * Smoke test: every registered endpoint responds (no "Not found Endpoint" 404).
 * Auth-protected routes are expected to return 401 without a token.
 */
import express from 'express';
import request from 'supertest';
import indexRouter from '../../routes/index';
import { NotFoundEndpoint, errorValidation } from '../../middleware/error';

jest.mock('../../config/db', () => ({
  __esModule: true,
  default: jest.fn(),
  dbHealthCheck: jest.fn().mockResolvedValue(true),
}));

const app = express();
app.use(express.json());
app.use('/v1/api', indexRouter);
app.use(NotFoundEndpoint);
app.use(errorValidation);

const base = '/v1/api';

describe('Endpoint smoke tests – each route responds', () => {
  describe('Health', () => {
    it('GET /health', async () => {
      const res = await request(app).get(`${base}/health`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /health/ready', async () => {
      const res = await request(app).get(`${base}/health/ready`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /health/live', async () => {
      const res = await request(app).get(`${base}/health/live`);
      expect(res.status).toBe(200);
      expect(res.body?.alive).toBe(true);
    });
  });

  describe('Persons', () => {
    it('POST /persons', async () => {
      const res = await request(app).post(`${base}/persons`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /persons', async () => {
      const res = await request(app).get(`${base}/persons`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /persons/:id', async () => {
      const res = await request(app).get(`${base}/persons/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PATCH /persons/:id', async () => {
      const res = await request(app).patch(`${base}/persons/507f1f77bcf86cd799439011`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('DELETE /persons/:id', async () => {
      const res = await request(app).delete(`${base}/persons/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
  });

  describe('Users', () => {
    it('POST /users', async () => {
      const res = await request(app)
        .post(`${base}/users`)
        .send({ name: 'x', email: 'a@b.co', password: 'p' });
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('POST /users/logout', async () => {
      const res = await request(app).post(`${base}/users/logout`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /users', async () => {
      const res = await request(app).get(`${base}/users`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /users/search', async () => {
      const res = await request(app).get(`${base}/users/search`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /users/me', async () => {
      const res = await request(app).get(`${base}/users/me`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PUT /users/me', async () => {
      const res = await request(app).put(`${base}/users/me`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /users/:id', async () => {
      const res = await request(app).get(`${base}/users/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PUT /users/:id', async () => {
      const res = await request(app).put(`${base}/users/507f1f77bcf86cd799439011`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('DELETE /users/:id', async () => {
      const res = await request(app).delete(`${base}/users/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('POST /users/login', async () => {
      const res = await request(app)
        .post(`${base}/users/login`)
        .send({ email: 'a@b.co', password: 'p' });
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('POST /users/verify', async () => {
      const res = await request(app).post(`${base}/users/verify`).send({ token: 'x' });
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
  });

  describe('Church configs', () => {
    it('POST /churchConfigs', async () => {
      const res = await request(app).post(`${base}/churchConfigs`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /churchConfigs', async () => {
      const res = await request(app).get(`${base}/churchConfigs`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /churchConfigs/:id', async () => {
      const res = await request(app).get(`${base}/churchConfigs/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PATCH /churchConfigs/:id', async () => {
      const res = await request(app)
        .patch(`${base}/churchConfigs/507f1f77bcf86cd799439011`)
        .send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('DELETE /churchConfigs/:id', async () => {
      const res = await request(app).delete(`${base}/churchConfigs/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
  });

  describe('Members', () => {
    it('POST /members', async () => {
      const res = await request(app).post(`${base}/members`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /members', async () => {
      const res = await request(app).get(`${base}/members`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /members/:id', async () => {
      const res = await request(app).get(`${base}/members/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PATCH /members/:id', async () => {
      const res = await request(app).patch(`${base}/members/507f1f77bcf86cd799439011`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('DELETE /members/:id', async () => {
      const res = await request(app).delete(`${base}/members/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
  });

  describe('Ledger entries', () => {
    it('POST /ledgerEntries', async () => {
      const res = await request(app).post(`${base}/ledgerEntries`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('POST /ledgerEntries/reversal/:id', async () => {
      const res = await request(app).post(
        `${base}/ledgerEntries/reversal/507f1f77bcf86cd799439011`
      );
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /ledgerEntries', async () => {
      const res = await request(app).get(`${base}/ledgerEntries`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /ledgerEntries/:id', async () => {
      const res = await request(app).get(`${base}/ledgerEntries/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PATCH /ledgerEntries/:id', async () => {
      const res = await request(app)
        .patch(`${base}/ledgerEntries/507f1f77bcf86cd799439011`)
        .send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('DELETE /ledgerEntries/:id', async () => {
      const res = await request(app).delete(`${base}/ledgerEntries/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
  });

  describe('Ministries', () => {
    it('POST /ministries', async () => {
      const res = await request(app).post(`${base}/ministries`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /ministries', async () => {
      const res = await request(app).get(`${base}/ministries`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /ministries/:id', async () => {
      const res = await request(app).get(`${base}/ministries/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PATCH /ministries/:id', async () => {
      const res = await request(app).patch(`${base}/ministries/507f1f77bcf86cd799439011`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('DELETE /ministries/:id', async () => {
      const res = await request(app).delete(`${base}/ministries/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
  });

  describe('Events', () => {
    it('POST /events', async () => {
      const res = await request(app).post(`${base}/events`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /events', async () => {
      const res = await request(app).get(`${base}/events`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('GET /events/:id', async () => {
      const res = await request(app).get(`${base}/events/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('PATCH /events/:id', async () => {
      const res = await request(app).patch(`${base}/events/507f1f77bcf86cd799439011`).send({});
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
    it('DELETE /events/:id', async () => {
      const res = await request(app).delete(`${base}/events/507f1f77bcf86cd799439011`);
      expect(res.status).not.toBe(404);
      expect(res.body?.message || '').not.toContain('Not found Endpoint');
    });
  });

  it('unmounted path returns 404 with Not found Endpoint message', async () => {
    const res = await request(app).get(`${base}/nonexistent`);
    expect(res.status).toBe(404);
    expect(res.body?.message || '').toContain('Not found Endpoint');
  });
});
