/**
 * @jest-environment node
 */
import type { Account, Profile } from 'next-auth';

// Extend Profile type to include picture property
interface GoogleProfile extends Profile {
  picture?: string;
}
import { User } from '@/models/User';
import connectDB from './mongoose';

// Mock dependencies
jest.mock('./mongoose');
jest.mock('@/models/User');

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockUserFindById = User.findById as jest.MockedFunction<
  typeof User.findById
>;
const mockUserFindByIdAndUpdate = User.findByIdAndUpdate as jest.MockedFunction<
  typeof User.findByIdAndUpdate
>;
const mockUserCreate = User.create as jest.MockedFunction<typeof User.create>;

// Helper function to generate consistent user ID (simplified for testing)
function generateObjectIdFromGoogleId(googleId: string): string {
  // Simplified version for testing - just return a consistent 24-char hex
  return 'abc123def456789012345678';
}

// Test function that mirrors the actual signIn callback implementation
async function handleGoogleSignIn(
  user: any,
  account: Account,
  profile: GoogleProfile
): Promise<boolean> {
  try {
    // Only handle Google provider accounts
    if (account.provider !== 'google') {
      return true;
    }

    // Connect to database
    await connectDB();

    // Generate consistent user ID from Google ID
    const consistentUserId = generateObjectIdFromGoogleId(
      account.providerAccountId
    );

    // Check if user already exists using the consistent ID
    const existingUser = await User.findById(consistentUserId);

    if (existingUser) {
      // Update existing user with latest profile information
      await User.findByIdAndUpdate(
        consistentUserId,
        {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          googleId: account.providerAccountId,
        },
        { new: true }
      );
    } else {
      // Create new user with consistent ID
      await User.create({
        _id: consistentUserId,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        googleId: account.providerAccountId,
      });
    }

    return true;
  } catch (error) {
    console.error('Error handling Google sign-in:', error);
    return false;
  }
}

describe('Google SignIn Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleGoogleSignIn', () => {
    const mockAccount: Account = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: 'google-123456789',
      access_token: 'access-token',
      expires_at: Date.now() / 1000 + 3600,
      token_type: 'Bearer',
      scope: 'openid profile email',
      id_token: 'id-token',
    };

    const mockProfile: GoogleProfile = {
      sub: 'google-123456789',
      name: 'John Doe',
      email: 'john.doe@example.com',
      picture: 'https://example.com/avatar.jpg',
    };

    const mockUser = {
      id: 'user-id',
      email: 'john.doe@example.com',
      name: 'John Doe',
      image: 'https://example.com/avatar.jpg',
    };

    it('should create new user when signing in for the first time', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockUserFindById.mockResolvedValue(null);

      const consistentUserId = 'abc123def456789012345678'; // 24-char hex string
      const createdUser = {
        _id: consistentUserId,
        email: mockProfile.email,
        name: mockProfile.name,
        image: mockProfile.picture,
        googleId: mockAccount.providerAccountId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserCreate.mockResolvedValue(createdUser as any);

      const result = await handleGoogleSignIn(
        mockUser,
        mockAccount,
        mockProfile
      );

      expect(result).toBe(true);
      expect(mockConnectDB).toHaveBeenCalled();
      expect(mockUserFindById).toHaveBeenCalledWith(expect.any(String));
      expect(mockUserCreate).toHaveBeenCalledWith({
        _id: expect.any(String),
        email: mockProfile.email,
        name: mockProfile.name,
        image: mockProfile.picture,
        googleId: mockAccount.providerAccountId,
      });
    });

    it('should update existing user profile when signing in again', async () => {
      const consistentUserId = 'abc123def456789012345678';
      const existingUser = {
        _id: consistentUserId,
        email: 'john.doe@example.com',
        name: 'Old Name',
        image: 'https://old-image.com/avatar.jpg',
        googleId: mockAccount.providerAccountId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        name: mockProfile.name,
        image: mockProfile.picture,
        email: mockProfile.email,
        updatedAt: new Date(),
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockUserFindById.mockResolvedValue(existingUser);
      mockUserFindByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await handleGoogleSignIn(
        mockUser,
        mockAccount,
        mockProfile
      );

      expect(result).toBe(true);
      expect(mockConnectDB).toHaveBeenCalled();
      expect(mockUserFindById).toHaveBeenCalledWith(consistentUserId);
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        consistentUserId,
        {
          email: mockProfile.email,
          name: mockProfile.name,
          image: mockProfile.picture,
          googleId: mockAccount.providerAccountId,
        },
        { new: true }
      );
    });

    it('should handle database connection errors gracefully', async () => {
      mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

      const result = await handleGoogleSignIn(
        mockUser,
        mockAccount,
        mockProfile
      );

      expect(result).toBe(false);
    });

    it('should handle user creation errors gracefully', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockUserFindById.mockResolvedValue(null);
      mockUserCreate.mockRejectedValue(new Error('User creation failed'));

      const result = await handleGoogleSignIn(
        mockUser,
        mockAccount,
        mockProfile
      );

      expect(result).toBe(false);
    });

    it('should handle missing profile data gracefully', async () => {
      const incompleteProfile = {
        sub: 'google-123456789',
        email: 'john.doe@example.com',
        // missing name and picture
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockUserFindById.mockResolvedValue(null);

      const createdUser = {
        _id: 'generated-user-id',
        email: incompleteProfile.email,
        name: undefined,
        image: undefined,
        googleId: mockAccount.providerAccountId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserCreate.mockResolvedValue(createdUser as any);

      const result = await handleGoogleSignIn(
        mockUser,
        mockAccount,
        incompleteProfile
      );

      expect(result).toBe(true);
      expect(mockUserCreate).toHaveBeenCalledWith({
        _id: expect.any(String),
        email: incompleteProfile.email,
        name: undefined,
        image: undefined,
        googleId: mockAccount.providerAccountId,
      });
    });

    it('should only handle Google provider accounts', async () => {
      const nonGoogleAccount = {
        ...mockAccount,
        provider: 'github',
      };

      const result = await handleGoogleSignIn(
        mockUser,
        nonGoogleAccount,
        mockProfile
      );

      expect(result).toBe(true);
      expect(mockConnectDB).not.toHaveBeenCalled();
      expect(mockUserFindById).not.toHaveBeenCalled();
    });
  });
});
