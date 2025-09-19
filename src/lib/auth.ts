import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import crypto from 'crypto';

// Validate NextAuth secret strength at startup
function validateNextAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required');
  }

  if (secret.length < 32) {
    throw new Error(
      'NEXTAUTH_SECRET must be at least 32 characters long for security. Generate one with: openssl rand -base64 32'
    );
  }
}

// Validate secret on module load
validateNextAuthSecret();

// Helper function to generate a consistent MongoDB ObjectID from Google ID
function generateObjectIdFromGoogleId(googleId: string): string {
  // Use SHA-256 with secret salt for cryptographically secure user ID generation
  const hash = crypto
    .createHash('sha256')
    .update(googleId + process.env.NEXTAUTH_SECRET)
    .digest('hex');
  return hash.substring(0, 24); // ObjectID is 24 character hex string
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.googleId) {
        // Generate consistent ObjectID from Google ID
        session.user.id = generateObjectIdFromGoogleId(
          token.googleId as string
        );
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && account.providerAccountId) {
        token.googleId = account.providerAccountId;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  // SECURITY: Strong secret validated at startup - used for JWT signing
  secret: process.env.NEXTAUTH_SECRET,
};
