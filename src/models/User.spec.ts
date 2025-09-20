/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { User } from './User';
import type { IUser } from './User';

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to in-memory MongoDB for testing
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI_TEST ||
          'mongodb://localhost:27017/todo-app-test'
      );
    }
  });

  afterAll(async () => {
    // Clean up database and close connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all user data before each test
    await User.deleteMany({});
  });

  describe('Schema validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        googleId: 'google-12345',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBe(userData._id);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.image).toBe(userData.image);
      expect(savedUser.googleId).toBe(userData.googleId);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require email field', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test User',
        googleId: 'google-12345',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(/email.*required/i);
    });

    it('should require googleId field', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439013',
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(/googleId.*required/i);
    });

    it('should validate email format', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439014',
        email: 'invalid-email',
        name: 'Test User',
        googleId: 'google-12345',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(/email.*invalid/i);
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439015',
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google-12345',
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User({
        ...userData,
        _id: '507f1f77bcf86cd799439016',
        googleId: 'google-67890',
      });

      await expect(user2.save()).rejects.toThrow(/duplicate key error/i);
    });

    it('should enforce unique googleId constraint', async () => {
      const userData1 = {
        _id: '507f1f77bcf86cd799439017',
        email: 'test1@example.com',
        name: 'Test User 1',
        googleId: 'google-12345',
      };

      const userData2 = {
        _id: '507f1f77bcf86cd799439018',
        email: 'test2@example.com',
        name: 'Test User 2',
        googleId: 'google-12345',
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);

      await expect(user2.save()).rejects.toThrow(/duplicate key error/i);
    });

    it('should allow name to be optional', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439019',
        email: 'test@example.com',
        googleId: 'google-12345',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.name).toBeUndefined();
    });

    it('should allow image to be optional', async () => {
      const userData = {
        _id: '507f1f77bcf86cd79943901a',
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google-12345',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.image).toBeUndefined();
    });
  });

  describe('Indexes', () => {
    it('should have index on email for efficient lookups', async () => {
      const indexes = await User.collection.getIndexes();
      const emailIndexExists = Object.keys(indexes).some(key =>
        key.includes('email')
      );
      expect(emailIndexExists).toBe(true);
    });

    it('should have index on googleId for efficient lookups', async () => {
      const indexes = await User.collection.getIndexes();
      const googleIdIndexExists = Object.keys(indexes).some(key =>
        key.includes('googleId')
      );
      expect(googleIdIndexExists).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt on creation', async () => {
      const userData = {
        _id: '507f1f77bcf86cd79943901b',
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google-12345',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(savedUser.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should update updatedAt timestamp when document is modified', async () => {
      const userData = {
        _id: '507f1f77bcf86cd79943901c',
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google-12345',
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedUser.name = 'Updated Name';
      const updatedUser = await savedUser.save();

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });
});
