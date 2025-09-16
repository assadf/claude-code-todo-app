import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import crypto from 'crypto';

// Helper function to generate a consistent MongoDB ObjectID from Google ID
function generateObjectIdFromGoogleId(googleId: string): string {
  const hash = crypto.createHash('md5').update(googleId).digest('hex');
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
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/error',
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
  secret: process.env.NEXTAUTH_SECRET,
};
