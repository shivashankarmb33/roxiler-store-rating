const request = require('supertest');
const app = require('../src/server');
const { pool } = require('../src/config/db');

describe('Roxiler Store Rating Management API Tests', () => {
  let adminToken = '';
  let userToken = '';
  let ownerToken = '';
  let testStoreId = 1;

  afterAll(async () => {
    await pool.end();
  });

  describe('Health Check', () => {
    it('GET /api/health should return ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication & Validation', () => {
    it('POST /api/auth/login with valid admin credentials should succeed', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@roxiler.com',
          password: 'Admin@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.token;
    });

    it('POST /api/auth/login with valid normal user credentials should succeed', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'User@1234'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('USER');
      userToken = res.body.data.token;
    });

    it('POST /api/auth/login with valid store owner credentials should succeed', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner1@roxiler.com',
          password: 'Owner@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STORE_OWNER');
      ownerToken = res.body.data.token;
    });

    it('POST /api/auth/register should enforce name length between 20 and 60 chars', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Name', // Less than 20 chars
          email: 'short.test@example.com',
          password: 'ValidPass@123',
          address: '123 Test Street'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('between 20 and 60 characters');
    });

    it('POST /api/auth/register should enforce password complexity rules', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Valid Length User Name Required Here',
          email: 'pass.test@example.com',
          password: 'lowercaseonly123', // Missing uppercase and special char
          address: '123 Test Street'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register should register with compliant credentials', async () => {
      const uniqueEmail = `test.user.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Newly Registered Regular Test User',
          email: uniqueEmail,
          password: 'SecurePass@2026', // 15 characters: within 8-16, uppercase + special
          address: '456 Verified Avenue, Silicon Valley, CA'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.user.password).toBeUndefined(); // Never expose passwords!
    });
  });

  describe('Role-Based Authorization', () => {
    it('Normal user cannot access admin dashboard endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard-stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Admin can access admin dashboard stats', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBeGreaterThan(0);
      expect(res.body.data.totalStores).toBeGreaterThan(0);
    });

    it('Admin can filter and sort users', async () => {
      const res = await request(app)
        .get('/api/admin/users?sortBy=name&sortOrder=ASC&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('Admin can create a new store', async () => {
      const uniqueStoreEmail = `store.${Date.now()}@teststore.com`;
      const res = await request(app)
        .post('/api/admin/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Pioneer Automated Retail Outlets Store',
          email: uniqueStoreEmail,
          address: '99 Innovation Drive, Technology Park, Austin, TX'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testStoreId = res.body.data.store.id;
    });
  });

  describe('Stores & Rating Submission/Modification', () => {
    it('Anyone can browse stores and search', async () => {
      const res = await request(app)
        .get('/api/stores?search=Apex');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stores.length).toBeGreaterThan(0);
    });

    it('Normal user can submit a rating (1-5)', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          store_id: testStoreId,
          rating: 4
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user_rating).toBe(4);
    });

    it('Normal user can modify their previous rating', async () => {
      const res = await request(app)
        .put(`/api/ratings/${testStoreId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user_rating).toBe(5);
    });

    it('Rating must reject values outside 1-5', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          store_id: testStoreId,
          rating: 6
        });

      expect(res.status).toBe(400);
    });

    it('Normal user can view their submitted ratings', async () => {
      const res = await request(app)
        .get('/api/ratings/my-ratings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.ratings)).toBe(true);
    });
  });

  describe('Store Owner Functionalities', () => {
    it('Store owner can access their store dashboard', async () => {
      const res = await request(app)
        .get('/api/store-owner/dashboard')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasStore).toBe(true);
      expect(res.body.data.stats.averageRating).toBeDefined();
    });

    it('Store owner can view users who rated their store', async () => {
      const res = await request(app)
        .get('/api/store-owner/ratings')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.ratings)).toBe(true);
      if (res.body.data.ratings.length > 0) {
        expect(res.body.data.ratings[0].user_name).toBeDefined();
        expect(res.body.data.ratings[0].rating).toBeDefined();
      }
    });
  });

  describe('Password Change', () => {
    it('User can change their password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'User@1234',
          newPassword: 'NewUserPass@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Revert back so other runs don't break
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'NewUserPass@123',
          newPassword: 'User@1234'
        });
    });
  });
});
