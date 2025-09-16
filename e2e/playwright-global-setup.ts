import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E tests for TODO List Creation');

  // Global setup tasks
  console.log('⚙️ Setting up test environment...');

  // You could add here:
  // - Database schema creation
  // - Test user creation
  // - External service mocking setup
  // - Environment validation

  // Validate required environment variables
  const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`
    );
    console.warn('Some tests may use mock values instead');
  }

  // Set test-specific environment variables if needed
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = 'test';
  }
  (process.env as any).PLAYWRIGHT_TEST = 'true';

  console.log('✅ Test environment setup complete');
}

export default globalSetup;
