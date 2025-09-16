import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up after E2E tests');

  // Global cleanup tasks
  console.log('⚙️ Running global cleanup...');

  // You could add here:
  // - Database cleanup
  // - Test user removal
  // - Temporary file cleanup
  // - Log file archiving

  // Clean up test environment
  delete (process.env as any).PLAYWRIGHT_TEST;

  console.log('✅ Global cleanup complete');
}

export default globalTeardown;
